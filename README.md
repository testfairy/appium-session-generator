# Appium Session Generator

This repo is an Appium test project generator tool for TestFairy sessions. You give it `sessionData` from a session and an apk file, it will give you back a zip file which you can directly upload to AWS Device Farm with little to no modifications.

It was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you can run to build or test this library.

### `npm build` or `yarn build`

Bundles the package to the `dist-*` folders for deployment. Currently supports Node and Browser.

The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `npm run build-node` or `yarn run build-node`

Bundles the package to `dist-node` for Node deployment.

### `npm run build-browser` or `yarn run build-browser`

Bundles the package to `dist-browser` for browser deployment. 

### `npm test` or `yarn test`

Runs the test watcher (Jest) to test the generator in node and browser.

### `npm run test-node` or `yarn run test-node`

Runs the test watcher (Jest) to test the generator in node.

### `npm run test-browser` or `yarn run test-browser`

Runs the test watcher (Jest) to test the generator in browser.
