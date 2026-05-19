module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|nativewind|react-native-css-interop|expo-secure-store|expo-modules-core|expo-notifications|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-chart-kit)/)',
  ],
  setupFilesAfterSetup: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/src/__tests__/**/*.test.(ts|tsx)'],
};
