// REFERENCE: https://github.com/shelfio/jest-mongodb

module.exports = {
  preset: '@shelf/jest-mongodb',
  testTimeout: 60 * 1000 * 5,
  verbose: true,
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-report',
      filename: 'report.html',
      expand: true,
    }],
  ],
  watchPathIgnorePatterns: ['globalConfig'],
};
