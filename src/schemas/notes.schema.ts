import * as mongoose from 'mongoose';

export const Notes = new mongoose.Schema({
    title: String,
    description: String,
    createdBy: String,
    sharedBy: String,
    createdAt: Number,
}, { collection: 'notes', autoIndex: false });