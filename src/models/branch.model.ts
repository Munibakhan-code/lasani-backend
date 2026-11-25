import { Schema, model, Document, Types } from 'mongoose';

export interface IBranch extends Document<Types.ObjectId> {
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  managerId?: Types.ObjectId | null;
  vatorIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    vatorIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Branch = model<IBranch>('Branch', branchSchema);