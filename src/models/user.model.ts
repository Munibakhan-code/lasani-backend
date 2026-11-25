import { Schema, model, Document, Types } from 'mongoose';
import { ALL_ROLES, Role, ROLES } from '../constants/roles';

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  branchId: Types.ObjectId | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Enforce branch invariants at schema level.
userSchema.pre('validate', function (next) {
  if (this.role === ROLES.ADMIN) this.branchId = null;
  if ((this.role === ROLES.MANAGER || this.role === ROLES.VATOR) && !this.branchId) {
    return next(new Error(`${this.role} must be assigned to a branch`));
  }
  next();
});

userSchema.index({ role: 1, branchId: 1 });

export const User = model<IUser>('User', userSchema);