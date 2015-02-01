'use strict';

var events = require('events');
var https = require('https');
var fs = require('fs');
var spawn = require('child_process').spawn;
var sinon = require('sinon');
var code = require('code');
var lab = module.exports.lab = require('lab').script();

var expect = code.expect;
var describe = lab.describe;
var it = lab.it;
var afterEach = lab.afterEach;

var signCertificate = require('../lib');

var test = function (key, cert, pass, done) {
  var server = https.createServer({
    key: fs.readFileSync(key, { encoding: 'utf8' }),
    cert: fs.readFileSync(cert, { encoding: 'utf8' }),
    passphrase: fs.readFileSync(pass, { encoding: 'utf8' })
  }, function (req, res) {
    res.end('ok');
  })
  .on('error', done)
  .listen(0, 'localhost', function () {
    var stdout = '';
    var stderr = '';

    var child = spawn('curl', [
      '-k',
      'https://localhost:' + this.address().port
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    .on('error', done)
    .on('exit', function (code) {
      if (code) return done();
      expect(stdout).to.equal('ok');
      server.close(done);
    });

    child.stderr.on('readable', function () {
      var chunk;
      while ((chunk = this.read()) !== null) {
        stderr += chunk;
      }
    });
    child.stdout.on('readable', function () {
      var chunk;
      while ((chunk = this.read()) !== null) {
        stdout += chunk;
      }
    });
  });
};

describe('ssl-self-signed-certificate', function () {
  afterEach(function (done) {
    try {
      fs.unlinkSync('localhost.key');
      fs.unlinkSync('localhost.crt');
      fs.unlinkSync('passphrase');
    } catch (err) {}
    done();
  });

  it('generates a self-signed certificates', function (done) {
    signCertificate('passphrase', function (err) {
      expect(err).to.not.exist();

      test('localhost.key', 'localhost.crt', 'passphrase', done);
    });
  });

  it('specific options can be specified', function (done) {
    signCertificate('passphrase', {
      keyFile: 'localhost.key',
      certificateFile: 'localhost.crt',
      passphraseFile: 'passphrase',
      days: 1
    }, function (err) {
      expect(err).to.not.exist();

      test('localhost.key', 'localhost.crt', 'passphrase', done);
    });
  });

  it('handles errors correctly while writing the passphrase file',
      function (done) {
    var writeFileError = new Error();
    sinon.stub(fs, 'writeFile').yields(writeFileError);

    signCertificate('passphrase', function (err) {
      expect(err).to.equal(writeFileError);
      fs.writeFile.restore();
      done();
    });
  });

  it('handles errors correctly while spawning the child process',
      function (done) {
    var envPath = process.env.PATH;
    process.env.PATH = '';

    signCertificate('passphrase', function (err) {
      expect(err).to.exist();
      process.env.PATH = envPath;
      done();
    });
  });

  it('handles erroneous exit codes of the child process',
      function (done) {
    var childProcess = require('child_process');
    sinon.stub(childProcess, 'spawn', function () {
      var emitter = new events.EventEmitter();
      emitter.stderr = new events.EventEmitter();
      process.nextTick(function () {
        emitter.emit('exit', 1);
      });
      return emitter;
    });

    signCertificate('passphrase', function (err) {
      expect(err).to.exist();
      childProcess.spawn.restore();
      done();
    });
  });
});