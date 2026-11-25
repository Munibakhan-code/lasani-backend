import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuCategory extends Document<Types.ObjectId> {
  branchId: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuCategorySchema = new Schema<IMenuCategory>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuCategorySchema.index({ branchId: 1, name: 1 }, { unique: true });

export const MenuCategory = model<IMenuCategory>('MenuCategory', menuCategorySchema);