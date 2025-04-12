import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    balance?: number;
    note?: string;
}

const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    balance: { type: Number, default: 0 },
    note: { type: String },
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);