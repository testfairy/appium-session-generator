module.exports = {
  modulePaths: ['src'],
  moduleDirectories: ['node_modules'],
  globals: {
    TF_BROWSER_TEST: process.env.TF_BROWSER_TEST
  }
};
