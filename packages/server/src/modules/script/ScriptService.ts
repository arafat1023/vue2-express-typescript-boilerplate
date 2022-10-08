import fs from 'fs';
import { join } from 'path';
import util from 'util';
import {
  UpdateWriteOpResult,
} from 'mongoose';
import ScriptModel from './ScriptModel';

const scriptsPath = join(__dirname, 'scripts');

export default class ScriptService {
  static async runScripts(): Promise<UpdateWriteOpResult[]> {
    const readFileAsync = util.promisify(fs.readdir);
    const scriptNames = await readFileAsync(scriptsPath);
    const executedScriptNames = await ScriptModel.getExecutedScriptNames();

    const nonExecutedScriptNames = scriptNames
      .filter((s) => !executedScriptNames.includes(s) && s.split('.').pop() === 'js');

    const scriptExecutionPromises = nonExecutedScriptNames
      .map(async (nonExecutedScriptName: string) => {
      // eslint-disable-next-line
      const script = require(join(scriptsPath, nonExecutedScriptName));

        if (typeof script !== 'function') {
          return ScriptModel
            .markError(nonExecutedScriptName, 'Script must be a functions');
        }

        try {
          // if output of script is not a promise, make it a promise
          await Promise.resolve(script());
          // eslint-disable-next-line no-console
          console.log(`Executed script '${nonExecutedScriptName}'`);
          return ScriptModel.markExecuted(nonExecutedScriptName);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Error while executed script '${nonExecutedScriptName}'`);
          // eslint-disable-next-line no-console
          console.error(err);

          return ScriptModel.markError(nonExecutedScriptName, err);
        }
      });

    return Promise.all(scriptExecutionPromises);
  }
}
