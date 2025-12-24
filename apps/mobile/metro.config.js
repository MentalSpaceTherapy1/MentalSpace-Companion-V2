// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project root
const projectRoot = __dirname;

// Check if we're in a monorepo context
const monorepoRoot = path.resolve(projectRoot, '../..');
const isMonorepo = fs.existsSync(path.join(monorepoRoot, 'package.json')) &&
                   fs.existsSync(path.join(monorepoRoot, 'packages'));

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

if (isMonorepo) {
  // Running in monorepo context (local development)
  config.watchFolders = [monorepoRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ];
} else {
  // Running standalone (EAS Build)
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
  ];
}

// Include the local shared package
config.resolver.extraNodeModules = {
  '@mentalspace/shared': path.resolve(projectRoot, 'shared'),
};

module.exports = config;

