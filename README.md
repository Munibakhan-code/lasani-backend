# Restaurant Management & Customer Ordering System — Backend (Phase 1)

Production-grade multi-branch restaurant backend built with **Node.js, Express, TypeScript, MongoDB, Mongoose, Socket.IO, and JWT**.

> ⚠️ This is a real client project. Code is written to be clean, secure, and maintainable.  
> Frontend-supplied roles, branchIds, prices, and totals are **never trusted**.

---

## ✨ Features (Phase 1)

- JWT authentication with refresh-token rotation (httpOnly cookie)
- Argon2id password hashing
- Four roles: **CLIENT, MANAGER, VATOR, ADMIN**
- Multi-branch support with branch-scoped authorization
- Branch management (ADMIN create/delete, scoped read/update)
- User management (ADMIN)
- Menu categories & items (branch-scoped)
- Cloudinary image upload/delete (backend-only credentials)
- Order creation with **server-side price calculation**
- Order status state machine (validated transitions)
- Socket.IO real-time `order:created`, `order:status_changed`, `order:updated`
- Helmet, CORS whitelist, rate limiting, HPP protection
- Zod request validation
- Centralized error handling & consistent API response shape
- Redis-ready architecture

---

## 🧱 Project Structure

```
src/
├── config/         # env, db, cors, cloudinary, logger, redis
├── controllers/    # thin HTTP layer
├── services/       # business logic
├── repositories/   # data access
├── models/         # Mongoose schemas
├── routes/         # express routers
├── middlewares/    # auth, roles, branch access, validation, errors
├── validators/     # Zod schemas
├── sockets/        # socket.io infra
├── jobs/           # background jobs
├── utils/          # ApiError, ApiResponse, jwt, password, etc.
├── types/          # global type declarations
├── constants/      # roles, order status/source, error codes
├── app.ts
└── server.ts
```

---

## 🚀 Setup

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env

# 3. Fill env vars (Mongo, JWT secrets, Cloudinary, email)

# 4. Run dev
npm run dev
```

Server runs at `http://localhost:5000/api/v1`.

---

## 🔐 Roles

| Role     | branchId          | Scope                                          |
|----------|-------------------|------------------------------------------------|
| CLIENT   | null (may pass in order) | Own online orders only                  |
| MANAGER  | required          | Their branch (menus, orders)                   |
| VATOR    | required          | Their branch (orders)                          |
| ADMIN    | null              | Everything                                     |

Role/branch are resolved from the JWT → DB, **never** from the request body.

---

## 🔌 API Endpoints

### Auth — `/api/v1/auth`
| Method | Path                | Access    |
|--------|---------------------|-----------|
| POST   | `/login`            | public    |
| POST   | `/logout`           | any       |
| GET    | `/me`               | any auth  |
| POST   | `/refresh`          | cookie    |
| POST   | `/forgot-password`  | public    |
| POST   | `/reset-password`   | public    |

### Branches — `/api/v1/branches`
| Method | Path                | Access                      |
|--------|---------------------|-----------------------------|
| GET    | `/`                 | public (active only)        |
| GET    | `/manage`           | ADMIN / MANAGER / VATOR     |
| GET    | `/:branchId`        | scoped                      |
| POST   | `/`                 | ADMIN                       |
| PATCH  | `/:branchId`        | ADMIN or owning MANAGER     |
| DELETE | `/:branchId`        | ADMIN                       |

### Users — `/api/v1/users`
| Method | Path                    | Access |
|--------|-------------------------|--------|
| GET    | `/`                     | ADMIN  |
| GET    | `/:id`                  | ADMIN  |
| POST   | `/`                     | ADMIN  |
| PATCH  | `/:id`                  | ADMIN  |
| PATCH  | `/:id/password`         | ADMIN  |
| PATCH  | `/:id/status`           | ADMIN  |

### Menu
| Method | Path                                       | Access                |
|--------|--------------------------------------------|-----------------------|
| GET    | `/branches/:branchId/menu`                 | any                   |
| GET    | `/branches/:branchId/menu/categories`      | any                   |
| GET    | `/branches/:branchId/menu/items`           | any                   |
| POST   | `/menu/categories`                         | ADMIN / MANAGER       |
| PATCH  | `/menu/categories/:id`                     | ADMIN / MANAGER       |
| DELETE | `/menu/categories/:id`                     | ADMIN / MANAGER       |
| POST   | `/menu/items`                              | ADMIN / MANAGER       |
| GET    | `/menu/items`                              | ADMIN/MANAGER/VATOR   |
| GET    | `/menu/items/:id`                          | ADMIN/MANAGER/VATOR   |
| PATCH  | `/menu/items/:id`                          | ADMIN / MANAGER       |
| DELETE | `/menu/items/:id`                          | ADMIN / MANAGER       |

### Orders
| Method | Path                                        | Access                        |
|--------|---------------------------------------------|-------------------------------|
| POST   | `/orders`                                   | CLIENT (also staff)           |
| GET    | `/orders`                                   | CLIENT (own)                  |
| GET    | `/orders/:orderId`                          | CLIENT (own)                  |
| POST   | `/vator/orders`                             | VATOR / MANAGER / ADMIN       |
| GET    | `/management/orders`                        | ADMIN / MANAGER / VATOR       |
| GET    | `/management/orders/:orderId`               | ADMIN / MANAGER / VATOR       |
| PATCH  | `/management/orders/:orderId/status`        | ADMIN / MANAGER / VATOR       |

### Uploads
| Method | Path                | Access             |
|--------|---------------------|--------------------|
| POST   | `/uploads/image`    | ADMIN / MANAGER    |
| DELETE | `/uploads/image`    | ADMIN / MANAGER    |

---

## 📦 Models

- **User** — name, email, phone, passwordHash, role, branchId, isActive, lastLoginAt
- **Branch** — name, address, phone, isActive, managerId, vatorIds
- **MenuCategory** — branchId, name, description, image, sortOrder, isActive
- **MenuItem** — branchId, categoryId, name, price, image, cloudinaryPublicId, isAvailable, isActive
- **Order** — orderNumber, branchId, clientId, createdBy, orderSource, items[], subtotal, total, status, notes, confirmedAt, completedAt

`OrderItem` embeds `nameSnapshot` and `priceSnapshot` so historical orders remain immutable when the menu changes.

---

## 📡 Socket.IO

### Rooms
- `user:{userId}`
- `branch:{branchId}`
- `role:admin`

### Client → Server
- `authenticate` — send JWT access token to establish socket identity
- `join_branch` — optional; server-side validated
- `join_user` — optional; only for own user room

### Server → Client
- `order:created` — emitted to `branch:{branchId}` and `role:admin`
- `order:status_changed` — emitted to `branch:{branchId}` and `user:{clientId}`
- `order:updated`
- `notification:new`

> Cross-branch leakage is prevented: branch A orders never reach branch B.

---

## ⚙️ Environment Variables

See `.env.example`. Key ones:

| Variable              | Purpose                          |
|-----------------------|----------------------------------|
| `MONGO_URI`           | MongoDB connection string        |
| `JWT_ACCESS_SECRET`   | Sign access tokens               |
| `JWT_REFRESH_SECRET`  | Sign refresh tokens              |
| `CORS_WHITELIST`      | Comma-separated origins          |
| `CLOUDINARY_*`        | Cloudinary credentials           |
| `SMTP_*` / `RESEND_*` | Email provider config            |
| `REDIS_URL`           | Optional — enables Redis adapter |

---

## 🔒 Security Highlights

- Helmet, HPP, CORS whitelist, compression
- Global + auth-specific rate limiting
- Argon2id password hashing
- Zod validation on body/query/params
- Server-side price & total calculation
- Server-side status transition validation
- Role + branch authorization middleware
- No stack traces in production
- Mongoose `sanitizeFilter` to prevent operator injection

---

## 🧪 Testing Checklist (Phase 1)

1. Admin login
2. Admin creates branch
3. Admin creates manager (assigned to branch)
4. Admin creates vator (assigned to branch)
5. Manager can access only assigned branch
6. Vator can access only assigned branch
7. Manager cannot access another branch (403)
8. Vator cannot access another branch (403)
9. Admin can access all branches
10. Menu category + item creation works
11. Cloudinary image upload works
12. Client creates an order
13. Backend calculates correct total
14. Manager receives `order:created` socket event
15. Client receives `order:status_changed` socket event
16. Unauthorized users get 401 / 403

### Quick smoke test (curl)

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'

# Create branch
curl -X POST http://localhost:5000/api/v1/branches \
  -H "Authorization: Bearer <ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Downtown","address":"1 Main St"}'

# Create menu item
curl -X POST http://localhost:5000/api/v1/menu/items \
  -H "Authorization: Bearer <MANAGER_ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"<BRANCH_ID>","categoryId":"<CAT_ID>","name":"Burger","price":9.99}'

# Client order
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer <CLIENT_ACCESS>" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"<BRANCH_ID>","items":[{"menuItemId":"<ITEM_ID>","quantity":2}]}'
```

---

## 📌 Known Limitations (Phase 1)

- Refresh-token store is in-memory → swap to Redis in Phase 2 (interface is ready)
- Inventory, reviews, and delivery tracking are out of scope
- Payment integration is not included
- Menu item image replacement does not auto-delete the previous Cloudinary asset unless `cloudinaryPublicId` is updated by the client
- Socket.IO uses the default in-memory adapter; use `@socket.io/redis-adapter` when scaling horizontally

---

## 🗺 Roadmap (Phase 2+)

- Inventory per branch
- Reviews & ratings
- Delivery driver assignment
- Redis adapter for Socket.IO
- Background jobs (order timeout, cleanup)
- Payment gateway
- Admin analytics dashboard
- Full test suite (Jest + Supertest)

---

## 📄 License

Proprietary — internal client project. Do not redistribute.