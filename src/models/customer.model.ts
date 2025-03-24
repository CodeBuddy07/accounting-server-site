import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    dues?: number;
    receivable?: number;
    note?: string;
}

const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dues: { type: Number, default: 0 },
    receivable: { type: Number, default: 0 },
    note: { type: String },
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);