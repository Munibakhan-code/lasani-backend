import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuItem extends Document<Types.ObjectId> {
  branchId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  cloudinaryPublicId?: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    cloudinaryPublicId: { type: String },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ branchId: 1, categoryId: 1, name: 1 }, { unique: true });

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);