import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
    name: string;
    content: string;
}

const TemplateSchema: Schema = new Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
});

export default mongoose.model<ITemplate>('Template', TemplateSchema);