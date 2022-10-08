import { model, Document } from 'mongoose';
import UniqueCodeSchema from './UniqueCodeSchema';

interface UniqueCodeDocument extends Document {
  kind: string;
  code: number;
}

const BaseModel = model<UniqueCodeDocument>('unique-codes', UniqueCodeSchema);

// eslint-disable-next-line import/prefer-default-export
export async function getCode(kind: 'user'): Promise<number> {
  const currentCode = await BaseModel.findOne({ kind });
  if (!currentCode) {
    await BaseModel.create({
      kind,
      code: 1,
    });
    return 1;
  }
  await BaseModel.updateOne({ _id: currentCode._id }, { $inc: { code: 1 } });
  return currentCode.code + 1;
}
