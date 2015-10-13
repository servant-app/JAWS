'use strict';

/**
 * JAWS Test: New Action Command
 */

var Jaws = require('../../lib/index.js'),
  CmdNewAction = require('../../lib/commands/module_create'),
  JawsError = require('../../lib/jaws-error'),
  testUtils = require('../test_utils'),
  Promise = require('bluebird'),
  path = require('path'),
  assert = require('chai').assert,
  fs = require('fs');

var config = require('../config'),
  projPath,
  JAWS;

describe('Test "new module" command', function () {

  before(function (done) {
    this.timeout(0);
    testUtils.createTestProject(
      config.name,
      config.stage,
      config.region,
      config.domain,
      config.iamRoleArnLambda,
      config.iamRoleArnApiGateway)
      .then(function (pp) {
        projPath = pp;
        process.chdir(projPath);
        JAWS = new Jaws();
        done();
      });
  });

  describe('Positive tests', function () {

    it('Test "new module" command', function (done) {
      this.timeout(0);

      var module = {
        type: 'both',
        name: 'users',
        action: 'list',
        runtime: 'nodejs',
        pkgMgr: false,
      };

      CmdNewAction.run(JAWS, module.name, module.action, module.runtime, module.pkgMgr, module.type)
        .then(function () {
          var jawsJson = require(path.join(process.cwd(), 'aws_modules/users/list/awsm.json'));
          assert.isTrue(typeof jawsJson.lambda.cloudFormation !== 'undefined');
          assert.isTrue(jawsJson.lambda.cloudFormation.Runtime === 'nodejs');
          assert.isTrue(typeof jawsJson.apiGateway.cloudFormation !== 'undefined');
          assert.isTrue(jawsJson.apiGateway.cloudFormation.Path === 'users/list');
          done();
        })
        .catch(JawsError, function (e) {
          done(e);
        })
        .error(function (e) {
          done(e);
        });
    });

    it('Test "new java8 module" command', function (done) {
      this.timeout(0);

      var module = {
        type: 'both',
        name: 'users',
        action: 'GetJava8',
        runtime: 'java8',
        pkgMgr: 'mvn',
      };

      CmdNewAction.run(JAWS, module.name, module.action, module.runtime, module.pkgMgr, module.type)
        .then(function () {
          var jawsJson = require(path.join(process.cwd(), 'aws_modules/users/getjava8/awsm.json'));
          assert.isTrue(typeof jawsJson.lambda.cloudFormation !== 'undefined');
          assert.isTrue(jawsJson.lambda.cloudFormation.Runtime === 'java8');
          assert.isTrue(jawsJson.lambda.cloudFormation.Handler === 'com.test_prj.users.Lambda::getjava8');
          assert.isTrue(typeof jawsJson.apiGateway.cloudFormation !== 'undefined');
          assert.isTrue(jawsJson.apiGateway.cloudFormation.Path === 'users/getjava8');
          assert.isTrue(typeof fs.openSync(path.join(process.cwd(), 'aws_modules', 'users', 'getjava8', 'src', 'main', 'java', 'Lambda.java'), 'r') !== 'undefined');
          assert.isTrue(typeof fs.openSync(path.join(process.cwd(), 'aws_modules', 'users', 'getjava8', 'pom.xml'), 'r') !== 'undefined');
          done();
        })
        .catch(JawsError, function (e) {
          done(e);
        })
        .error(function (e) {
          done(e);
        });
    });
  });
});
