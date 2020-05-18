var wd = require('wd');

require('colors');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var expect = chai.expect;
var assert = chai.assert;

module.exports = {
  should: should,
  expect: expect,
  assert: assert
};
