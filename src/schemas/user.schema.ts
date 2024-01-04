import * as mongoose from 'mongoose';

export const User = new mongoose.Schema({
  emailId: String,
  password: String,
  status: String,
  createdAt: Number,
}, { collection: 'users', autoIndex: false  });