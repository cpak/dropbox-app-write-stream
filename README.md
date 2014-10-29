# dropbox-app-write-stream 

Stream files to your Dropbox app


## Install

```bash
$ npm install --save dropbox-app-write-stream
```


## Usage

This module uses the [Dropbox Core API](https://www.dropbox.com/developers/core/docs)

```javascript

// Write all my text files to Dropbox
// Note that files can only be written to directories inside
// the current token's app's root (i.e. Apps/MyAppName/)

var fs = require('fs');
var dbAppWs = require('dropbox-app-write-stream');

var ds = dbAppWs({
    chunked: false,
    token: 'myDropboxAppToken',
    path: '/uploads/text',
    name: 'myUploadedFile',
    suffix: '.txt',
    params: { autorename: false }
});

fs.readdir('./my-txt-files', function (err, files) {
    files.forEach(function (fileName) {
        if (fileName.charAt(0) !== '.') {
            fs.readFileSync('./my-txt-files/' + fileName, function (err, content) {
                ds.push(content);
            });
        }
    });
});


```

## API

Constructor takes a map of options:
```javascript
{
    chunked: boolean, if true all input chunks will be streamed to the same file (designated by `opts.file.path`),
    token: string, OAuth2 token,
    path: string, a string representing either the Dropbox file path to write to (if streaming upload), or
          the Dropbox dir path under which each chunk will be stored,
    name: string, if writing each chunk to an individual file, files will be written to `{path}/{name}-i-{suffix}`,
    suffix: string, only used if writing each chunk to an individual file
    params: a map of any URL parameters to be used (see [Dropbox Core API docs](https://www.dropbox.com/developers/core/docs#files_put) for details)
}
```



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).


## Release History
0.0.1 first working implementation


## TODO
-   tests
-   chunked uploads
-   verbose mode (don't use console.log...)


## License

Copyright (c) 2014 christofer pak. Licensed under the MIT license.
