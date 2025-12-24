module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline environment variables at compile time for production builds
      ['transform-inline-environment-variables', {
        include: [
          'EXPO_ROUTER_APP_ROOT',
          'EXPO_ROUTER_IMPORT_MODE',
          // Firebase configuration
          'EXPO_PUBLIC_FIREBASE_API_KEY',
          'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
          'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
          'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
          'EXPO_PUBLIC_FIREBASE_APP_ID'
        ]
      }]
    ],
  };
};

