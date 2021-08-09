module.exports = {
    moduleFileExtensions: ["js", "ts"],
    testRegex: "(/test/.*|(\\.|/)(test|spec))\\.ts?$",
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    testEnvironment: 'jsdom'
};