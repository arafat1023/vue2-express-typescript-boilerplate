import { Schema } from 'mongoose';

export default new Schema({
  name: {
    type: String,
    required: true,
  },
  isExecuted: {
    type: Boolean,
    default: false,
  },
  error: String,
  stack: String,
}, { timestamps: true });
