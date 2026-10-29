const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([expo, { ignores: ['.test-build/**', 'dist/**', '.npm-cache/**'] }]);
