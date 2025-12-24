module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline environment variables at compile time for production builds
      ['transform-inline-environment-variables', {
        include: ['EXPO_ROUTER_APP_ROOT']
      }]
    ],
  };
};

