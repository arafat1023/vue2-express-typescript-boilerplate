const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server-core');

/** @type {MongoMemoryServer} */
let mongoMemoryServer;

async function connectDatabase() {
  mongoMemoryServer = new MongoMemoryServer();
  const uri = await mongoMemoryServer.getUri();
  const { connection } = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  return connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  await mongoMemoryServer.stop();
}

exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
