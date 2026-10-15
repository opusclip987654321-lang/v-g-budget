// Règles de code de l'appli (npx expo lint). Voir README.md, « Règles du code ».
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist-check/*', 'dist-check-web/*', '.expo/*'] },
  {
    rules: {
      'import/no-cycle': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Les briques d'interface ne connaissent pas le store : elles reçoivent tout par leurs props.
    files: ['src/ui/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['@/store', '@/store/*', '@/features/*'], message: 'src/ui ne lit pas le store : passez les valeurs en props.' }] }] },
  },
  {
    // Les routes restent fines : l'écran vit dans src/features.
    files: ['src/app/**'],
    ignores: ['src/app/**/_layout.tsx'],
    rules: { 'no-restricted-syntax': ['error', { selector: 'FunctionDeclaration', message: 'Mettez l’écran dans src/features et ré-exportez-le ici.' }] },
  },
]);
