import { Types } from 'mongoose';
import { orderRepository } from '../repositories/order.repository';
import { menuItemRepository } from '../repositories/menuItem.repository';
import { branchRepository } from '../repositories/branch.repository';
import { Order } from '../models/order.model';
import { ApiError } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/orderNumber';
import { OrderStatus, STATUS_TRANSITIONS } from '../constants/orderStatus';
import { ORDER_SOURCE, OrderSource } from '../constants/orderSource';
import { ROLES, Role } from '../constants/roles';
import { ERROR_CODES } from '../constants/errorCodes';
import { socketService } from './socket.service';

interface CreateOrderInput {
  branchId: string;
  items: { menuItemId: string; quantity: number }[];
  notes?: string;
  orderSource?: OrderSource;
}

interface AuthContext {
  id: string;
  role: Role;
  branchId: string | null;
}

export const orderService = {
  async create(input: CreateOrderInput, auth: AuthContext) {
    const branch = await branchRepository.findById(input.branchId);
    if (!branch || !branch.isActive) {
      throw ApiError.badRequest('Branch not available');
    }

    // Branch-level authorization for staff. ADMIN bypasses.
    if (auth.role === ROLES.MANAGER || auth.role === ROLES.VATOR) {
      if (!auth.branchId || String(auth.branchId) !== String(input.branchId)) {
        throw ApiError.forbidden(
          'Branch access denied',
          ERROR_CODES.BRANCH_ACCESS_DENIED
        );
      }
    }

    // Load every menu item server-side. Never trust client prices.
    const ids = input.items.map((i) => i.menuItemId);
    const items = await menuItemRepository.findByIds(ids);
    const map = new Map(items.map((i) => [String(i._id), i]));

    const orderItems = input.items.map((line) => {
      const item = map.get(String(line.menuItemId));
      if (!item) {
        throw ApiError.badRequest(`Menu item not found: ${line.menuItemId}`);
      }
      if (String(item.branchId) !== String(input.branchId)) {
        throw ApiError.badRequest(`Item "${item.name}" does not belong to this branch`);
      }
      if (!item.isActive || !item.isAvailable) {
        throw ApiError.badRequest(`Item "${item.name}" is not available`);
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 50) {
        throw ApiError.badRequest(`Invalid quantity for "${item.name}"`);
      }

      const subtotal = Number((item.price * line.quantity).toFixed(2));
      return {
        menuItemId: item._id,
        nameSnapshot: item.name,
        priceSnapshot: item.price,
        quantity: line.quantity,
        subtotal,
      };
    });

    const subtotal = Number(
      orderItems.reduce((sum, line) => sum + line.subtotal, 0).toFixed(2)
    );
    const total = subtotal; // Phase 1: no tax / delivery fees.

    const orderSource: OrderSource =
      auth.role === ROLES.CLIENT
        ? ORDER_SOURCE.ONLINE
        : input.orderSource ?? ORDER_SOURCE.VATOR;

    const created = await orderRepository.create({
      orderNumber: generateOrderNumber(),
      branchId: new Types.ObjectId(input.branchId),
      clientId: auth.role === ROLES.CLIENT ? new Types.ObjectId(auth.id) : null,
      createdBy: new Types.ObjectId(auth.id),
      orderSource,
      items: orderItems,
      subtotal,
      total,
      status: 'PENDING',
      notes: input.notes,
    });

    const payload = {
      id: String(created._id),
      orderNumber: created.orderNumber,
      branchId: String(created.branchId),
      total: created.total,
      status: created.status,
      createdAt: created.createdAt,
    };

    // Notify staff of the branch + global admins. Never leak to other branches.
    socketService.emitToBranch(String(created.branchId), 'order:created', payload);
    socketService.emitToAdmins('order:created', payload);

    return created;
  },

  async listForClient(clientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await orderRepository.list({ clientId }, skip, limit);
    return { items, total, page, limit };
  },

  async getForClient(orderId: string, clientId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    if (String(order.clientId) !== String(clientId)) {
      throw ApiError.forbidden('Not your order');
    }
    return order;
  },

  async listForStaff(
    auth: AuthContext,
    filter: { status?: OrderStatus; branchId?: string },
    page = 1,
    limit = 20
  ) {
    const query: Record<string, unknown> = {};

    if (auth.role === ROLES.ADMIN) {
      if (filter.branchId) query.branchId = filter.branchId;
    } else {
      if (!auth.branchId) throw ApiError.forbidden('No branch assigned');
      query.branchId = auth.branchId;
    }
    if (filter.status) query.status = filter.status;

    const skip = (page - 1) * limit;
    const [items, total] = await orderRepository.list(query, skip, limit);
    return { items, total, page, limit };
  },

  async getForStaff(orderId: string, auth: AuthContext) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    if (auth.role !== ROLES.ADMIN && String(order.branchId) !== String(auth.branchId)) {
      throw ApiError.forbidden(
        'Branch access denied',
        ERROR_CODES.BRANCH_ACCESS_DENIED
      );
    }
    return order;
  },

  async updateStatus(orderId: string, newStatus: OrderStatus, auth: AuthContext) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    // Branch authorization.
    if (auth.role !== ROLES.ADMIN && String(order.branchId) !== String(auth.branchId)) {
      throw ApiError.forbidden(
        'Branch access denied',
        ERROR_CODES.BRANCH_ACCESS_DENIED
      );
    }

    // State machine validation.
    const current = order.status as OrderStatus;
    const allowed = STATUS_TRANSITIONS[current] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_STATUS_TRANSITION,
        `Cannot transition from ${current} to ${newStatus}`
      );
    }

    const patch: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'CONFIRMED') patch.confirmedAt = new Date();
    if (newStatus === 'COMPLETED') patch.completedAt = new Date();

    const updated = await Order.findByIdAndUpdate(orderId, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) throw ApiError.internal('Failed to update order');

    const payload = {
      id: String(updated._id),
      orderNumber: updated.orderNumber,
      branchId: String(updated.branchId),
      status: updated.status,
      updatedAt: updated.updatedAt,
    };

    socketService.emitToBranch(String(updated.branchId), 'order:status_changed', payload);
    if (updated.clientId) {
      socketService.emitToUser(String(updated.clientId), 'order:status_changed', payload);
    }

    return updated;
  },
};