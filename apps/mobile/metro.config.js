// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add shared package resolution
config.resolver.extraNodeModules = {
  '@mentalspace/shared': path.resolve(__dirname, 'shared'),
};

module.exports = config;
