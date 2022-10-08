import { Schema, Types } from 'mongoose';

export default new Schema({
  siteIsActive: Boolean,
  updatedBy: {
    type: Types.ObjectId,
    required: true,
    ref: 'users',
  },
}, { timestamps: true });
