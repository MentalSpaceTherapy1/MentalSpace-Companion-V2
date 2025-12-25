module.exports = function (api) {
  api.cache(false);  // Force cache invalidation
  return {
    presets: [
      ['babel-preset-expo', {
        unstable_transformImportMeta: true,
      }]
    ],
    plugins: [
      'babel-plugin-transform-import-meta'
    ],
  };
};
