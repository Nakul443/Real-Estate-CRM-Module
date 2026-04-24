import { createDefaultPreset } from 'ts-jest';

const defaultPreset = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  // Tells Jest to handle .ts files as ESM
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    ...defaultPreset.transform,
  },
  // Maps the .js extensions in your imports back to .ts files
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};