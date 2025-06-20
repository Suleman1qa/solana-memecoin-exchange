const path = require('path');
const { createRequire } = require('module');
const { getDefaultConfig } = require('@expo/metro-config');

const requireFunc = createRequire(__filename);
const config = getDefaultConfig(__dirname);

// SVG support
config.transformer.babelTransformerPath = requireFunc.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
