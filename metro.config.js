const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

// Check if running inside a parent monorepo with its own package.json & node_modules
const isMonorepo = fs.existsSync(path.resolve(workspaceRoot, 'package.json')) &&
                   fs.existsSync(path.resolve(workspaceRoot, 'node_modules')) &&
                   workspaceRoot !== projectRoot;

const config = getDefaultConfig(projectRoot);

if (isMonorepo) {
  config.watchFolders = [workspaceRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ];
} else {
  config.watchFolders = [projectRoot];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
  ];
}

module.exports = config;
