import mongoose from 'mongoose';
import UserService from './modules/user/UserService';
import ScriptService from './modules/script/ScriptService';
import { dbServer } from './configs/server.config.json';

function genDbHost(dbName: string): string {
  if (dbServer && dbServer.startsWith('mongodb+srv:')) {
    // const uri = "mongodb+srv://USERNAME:PASSWORD@CLUSTER_NAME.*****.mongodb.net/DATABASE_NAME
    const uri = `${dbServer}/${dbName}`;
    return uri;
  }
  return `mongodb://${dbServer || 'localhost'}/${dbName}`;
}

async function connectDatabase(): Promise<void> {
  const dbHost = genDbHost('typescript-boilerplate');
  try {
    await mongoose.connect(dbHost, {
      connectTimeoutMS: 60 * 1000,
    });
    // eslint-disable-next-line no-console
    console.info(`Connected to database: '${mongoose.connection.db.databaseName}'`);

    try {
      await UserService.createAdminUser();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating admin user', err);
    }
    try {
      await ScriptService.runScripts();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error running scripts', err);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error connecting to database', err);
  }
}

export default connectDatabase;
