import {
  model,
  Document,
  UpdateWriteOpResult,
} from 'mongoose';
import ScriptSchema from './ScriptSchema';

export interface Script {
  _id?: string,
  name: string,
  isExecuted: boolean,
  error?: string,
  stack?: string,
}

interface ScriptDocument extends Script, Document<string> {
}

export default class ScriptModel {
  static BaseModel = model<ScriptDocument>('scripts', ScriptSchema);

  /**
   * Check if a script is already executed
   */
  static async hasExecuted(scriptName: string): Promise<boolean> {
    const script = await ScriptModel.BaseModel.findOne({
      name: scriptName,
      isExecuted: true,
    }).exec();
    return !!script;
  }

  /**
   * mark a script as executed
   */
  static async markExecuted(scriptName: string): Promise<UpdateWriteOpResult> {
    const script = await ScriptModel.BaseModel
      .updateOne(
        { name: scriptName },
        { $set: { isExecuted: true, error: undefined } },
        { upsert: true },
      )
      .exec();
    return script;
  }

  /**
   * mark a script as error
   */
  static async markError(scriptName: string, error: string | Error): Promise<UpdateWriteOpResult> {
    const script = await ScriptModel.BaseModel
      .updateOne(
        { name: scriptName },
        {
          $set: {
            isExecuted: false,
            error: String(error),
            stack: typeof error === 'string' ? undefined : error.stack,
          },
        },
        { upsert: true },
      )
      .exec();
    return script;
  }

  /**
   * get executed script names
   */

  static async getExecutedScriptNames(): Promise<string[]> {
    const executedScripts = await ScriptModel.BaseModel
      .find({ isExecuted: true })
      .select('name')
      .exec();

    return executedScripts.map((executedScript) => executedScript.name);
  }
}
