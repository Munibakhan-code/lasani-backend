import { Schema, model, Document, Types } from 'mongoose';
import { ALL_ORDER_STATUSES, OrderStatus } from '../constants/orderStatus';
import { ORDER_SOURCE, OrderSource } from '../constants/orderSource';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document<Types.ObjectId> {
  orderNumber: string;
  branchId: Types.ObjectId;
  clientId?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  orderSource: OrderSource;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  confirmedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderSource: { type: String, enum: Object.values(ORDER_SOURCE), required: true },
    items: { type: [orderItemSchema], required: true, validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have items'] },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ALL_ORDER_STATUSES, default: 'PENDING', index: true },
    notes: { type: String, trim: true, maxlength: 500 },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ branchId: 1, status: 1, createdAt: -1 });
orderSchema.index({ clientId: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);