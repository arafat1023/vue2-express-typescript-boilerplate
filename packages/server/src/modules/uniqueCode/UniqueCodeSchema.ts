import { Schema } from 'mongoose';

const UniqueCodeSchema = new Schema({
  kind: {
    type: String,
    required: true,
    enum: ['user'],
  },
  code: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default UniqueCodeSchema;
