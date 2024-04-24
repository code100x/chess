module.exports = {
  preset: 'ts-jest',  // Use the ts-jest preset
  testEnvironment: 'node',  // Specify the test environment to be Node
  transform: {
    "^.+\\.(js|mjs|jsx)$": "babel-jest",  // Continue using babel-jest for JavaScript files
    "^.+\\.(ts|tsx)$": "ts-jest",  // Use ts-jest for TypeScript files
  },
};
