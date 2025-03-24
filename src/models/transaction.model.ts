import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    type: 'sell' | 'buy' | 'receivable' | 'due' | 'expense';
    customerId?: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    note?: string;
}

const TransactionSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['sell', 'buy', 'receivable', 'due', 'expense'] },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);