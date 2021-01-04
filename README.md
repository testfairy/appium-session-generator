# Appium Session Generator

This repo is an Appium test project generator tool for TestFairy sessions. You give it `sessionData` from a session and an apk file, it will give you back a zip file which you can directly upload to AWS Device Farm or run remotely on real devices provided by Sauce Labs or Perfecto with little to no modifications.

It was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you can run to build or test this library.

`npm run build`

Bundles the package to the `dist` folder for deployment. Currently supports node.

The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

`npm run test`

Runs the test watcher (Jest) to test the generator in node.
