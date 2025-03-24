import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    buyingPrice: number;
    sellingPrice: number;
    note: string;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    note: { type: String },
});

export default mongoose.model<IProduct>('Product', ProductSchema);