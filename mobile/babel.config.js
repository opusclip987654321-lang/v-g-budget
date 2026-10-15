// Configuration Babel d'Expo, explicite pour que les tests transforment aussi le moteur partagé (../lib).
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
