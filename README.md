ssl-self-signed-certificate
===========================

#### Self-signed SSL certificate for development ####

[![npm version][npm-version-image]][npm-url]
[![Travis][travis-image]][travis-url]
[![Coveralls][coveralls-image]][coveralls-url]

```javascript
var signCertificate = require('ssl-self-signed-certificate');

signCertificate('my-passphrase', function (err) {
  // Generated files
  // ./localhost.key
  // ./localhost.crt
  // ./passphrase
});
```

I requires the `openssl` binary. For testing it requires `curl`.

___module_(passphrase, [options], callback) : undefined__

Generates a self-signed SSL certificate. It creates 3 files: key, certificate and passphrase. The passphrase file just contains the `passphrase` parameter. The callback receives an error as the first argument.

Options:

- __certificateFile__ - _String_  
  Filename for the certificate. Default is `localhost.crt`.
- __days__ - _Number_  
  Expiration time. Default is `365`.
- __keyFile__ - _String_  
  Filename for the key. Default is `localhost.key`.
- __passphraseFile__ - _String_  
  Filename for the passphrase. Default is `passphrase`.

[npm-version-image]: https://img.shields.io/npm/v/ssl-self-signed-certificate.svg?style=flat
[npm-url]: https://npmjs.org/package/ssl-self-signed-certificate
[travis-image]: https://img.shields.io/travis/gagle/node-ssl-self-signed-certificate.svg?style=flat
[travis-url]: https://travis-ci.org/gagle/node-ssl-self-signed-certificate
[coveralls-image]: https://img.shields.io/coveralls/gagle/node-ssl-self-signed-certificate.svg?style=flat
[coveralls-url]: https://coveralls.io/r/gagle/node-ssl-self-signed-certificate