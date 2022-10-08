module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'jest',
    },
    binary: {
      version: '5.0.2',
      downloadDir: './mongodb/',
    },
  },
};
