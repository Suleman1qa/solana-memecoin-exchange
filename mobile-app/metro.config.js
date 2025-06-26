<<<<<<< HEAD
const path = require('path');
const { createRequire } = require('module');
const { getDefaultConfig } = require('@expo/metro-config');

const requireFunc = createRequire(__filename);
const config = getDefaultConfig(__dirname);

// SVG support
config.transformer.babelTransformerPath = requireFunc.resolve('react-native-svg-transformer');
=======
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
>>>>>>> 4935994f15bb2f0ac41aae445393eba6e99356c1
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
