import { defaults as tsjPreset } from 'ts-jest/presets';
export default {
  preset: 'jest-puppeteer',
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  roots: ['<rootDir>/test/'],

  transform: {
    ...tsjPreset.transform,
  },
  
  moduleFileExtensions: ['ts','js']
};
