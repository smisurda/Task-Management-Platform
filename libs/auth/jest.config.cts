export default {
  displayName: 'auth',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@app/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@app/data/(.*)$': '<rootDir>/../../libs/data/src/$1',
  },
  testMatch: ['**/*.spec.ts'],
};
