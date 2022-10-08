// eslint-disable-next-line @typescript-eslint/no-var-requires
const { vueBuildMemory, vuePublicPath } = require('./src/configs/client.config.json');

const hasPublicPath = !!vuePublicPath.trim();

module.exports = {
  devServer: {
    progress: false,
  },
  pwa: {
    name: 'Site',
    themeColor: '#FE4642',
  },
  ...(hasPublicPath) && {
    publicPath: vuePublicPath.trim(),
  },
  chainWebpack: (config) => {
    config
      .plugin('VuetifyLoaderPlugin')
      .tap(() => [{
        progressiveImages: {
          resourceQuery: /lazy/,
          sharp: true,
          size: 12,
        },
      }]);

    config
      .plugin('fork-ts-checker')
      .tap((args) => {
        /**
          * For deployment in restricted memory, use small vueBuildMemory
          * default is 2048 MB
          */
        if (vueBuildMemory) {
          // eslint-disable-next-line no-param-reassign
          args[0].memoryLimit = vueBuildMemory; // MB
        }
        return args;
      });
  },
};
