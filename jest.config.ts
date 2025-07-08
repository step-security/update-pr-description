const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./test/jest.setup.ts'],
  transform: {
    ...tsJestTransformCfg,
  },
};
