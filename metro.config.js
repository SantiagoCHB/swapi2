// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  // Agrega el soporte para archivos .cjs
  config.resolver.sourceExts.push('cjs');
  // Desactiva las exportaciones inestables para resolver el error del componente auth
  config.resolver.unstable_enablePackageExports = false;
  return config;
})();