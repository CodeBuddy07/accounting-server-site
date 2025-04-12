import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    type: 'sell' | 'buy' | 'receivable' | 'due' | 'expense';
    customerId?: mongoose.Types.ObjectId;
    customerName?: string;
    productId?: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    note?: string;
    paymentType?: 'cash' | 'due';
}

const TransactionSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['sell', 'buy', 'receivable', 'due', 'expense'] },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
    paymentType: { type: String, enum: ['cash', 'due'],  default: 'cash' },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);