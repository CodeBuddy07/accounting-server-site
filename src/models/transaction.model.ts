import mongoose, { Schema, Document } from 'mongoose';

export interface IProductItem {
    productId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name: string; /* other product fields */ };
    price: number;
    quantity: number;
}

export interface ITransaction extends Document {
    type: 'sell' | 'buy' | 'receivable' | 'due' | 'expense';
    customerId?: mongoose.Types.ObjectId;
    customerName?: string;
    products: IProductItem[];
    total: number;
    date: Date;
    note?: string;
    paymentType?: 'cash' | 'due';
}

const TransactionSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['sell', 'buy', 'receivable', 'due', 'expense'] },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            price: {
                type: Number,
                min: 0,
                required: true
            },
            quantity: {
                type: Number,
                min: 1,
                required: true
            }
        }
    ],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
    paymentType: { type: String, enum: ['cash', 'due'], default: 'cash' },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);