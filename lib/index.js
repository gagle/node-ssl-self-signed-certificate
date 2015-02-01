'use strict';

var childProcess = require('child_process');
var fs = require('fs');

module.exports = function (passphrase, options, cb) {
  if (arguments.length === 2) {
    cb = options;
    options = {};
  }

  var keyFile = options.keyFile || 'localhost.key';
  var certificateFile = options.certificateFile || 'localhost.crt';
  var passphraseFile = options.passphraseFile || 'passphrase';
  var days = options.days || 365;

  var clean = function (err) {
    fs.unlink(keyFile, function () {
      fs.unlink(certificateFile, function () {
        fs.unlink(passphraseFile, function () {
          cb(err);
        });
      });
    });
  };

  fs.writeFile(passphraseFile, passphrase, function (err) {
    if (err) return cb(err);

    var stderr = '';

    childProcess.spawn('openssl', [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-keyout',
      keyFile,
      '-out',
      certificateFile,
      '-days',
      days,
      '-subj',
      '/CN=localhost',
      '-passout',
      'file:' + passphraseFile
    ], {
      stdio: ['ignore', 'ignore', 'pipe']
    })
    .on('error', function (err) {
      clean(err);
    })
    .on('exit', function (code) {
      if (code) return clean(new Error(stderr));
      cb();
    })
    .stderr.on('readable', function () {
      var chunk;
      while ((chunk = this.read()) !== null) {
        stderr += chunk;
      }
    });
  });
};