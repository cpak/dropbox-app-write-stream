'use strict';

var through = require('through2');
var request = require('request');

var FILES_PUT_URL = 'https://api-content.dropbox.com/1/files_put/auto/';
var defaultFileName = 'dbsw-';

/**
 * @param  {object} p URL parameter map
 * @param  {object} o file name options
 * @param  {number} i sequence number
 * @return {string}
 */
var slashesRx = new RegExp('^/+|/+$', 'g');
function getPath (o, i) {
    var name = o.name ? o.name + '-' : defaultFileName;
    var suf = o.suffix ? ( o.suffix.charAt(0) === '.' ? o.suffix : '-' + o.suffix ) : '';
    return o.path.replace(slashesRx, '') + '/' + name + i + suf;
}

function getParams(p) {
    var params = Object.keys(p).map(function (k) {
        return k + '=' + p[k];
    });
    return (params.length ? '?' + params.join('&') : '');
}

/**
 * Writes input to Dropbox.
 *
 * `opts`
 *         {
 *             chunked: boolean, if true all input chunks will be streamed to the same file (designated by `opts.file.path`),
 *             token: string, OAuth2 token,
 *             path: string, a string representing either the Dropbox file path to write to (if streaming upload), or
 *                   the Dropbox dir path under which each chunk will be stored,
 *             name: string, if writing each chunk to an individual file, files will be written to `{path}/{name}-i-{suffix}`,
 *             suffix: string, only used if writing each chunk to an individual file
 *             params: a map of any URL parameters to be used
 *         }
 *
 * @param  {string} path
 * @param  {object} opts
 * @return {stream}
 */
module.exports = function (opts) {
    var o = opts || {};
    var chunked = !!o.chunked;
    var token = o.token;
    var params = o.params || {};
    var pathOpts = {
        path: o.path,
        name: o.name,
        suffix: o.suffix
    };

    var i = 1;
    var write;

    if (!token) {
        throw new Error('Missing OAuth2 token');
    }
    if (!pathOpts.path) {
        throw new Error('Missing target path');
    }

    if (!chunked) {
        write = function (chunk, enc, next) {
            var url = FILES_PUT_URL + getPath(pathOpts, i++) + getParams(params);
            if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk)) {
                throw new Error('chunk must be a string or buffer');
            }
            console.log('[dropbox-app-write-stream] PUTting chunk', url);
            request.put({
                url: url,
                headers: {
                    Authorization: 'Bearer ' + token
                },
                body: chunk
            }, function (err, res, body) {
                console.log('[dropbox-app-write-stream] write successful: ' + !err + '\n', body);
                next(err, res);
            });
        };
    } else {
        /*
            1. Send a PUT request to /chunked_upload with the first chunk of the file without setting upload_id, and receive an upload_id in return.
            2. Repeatedly PUT subsequent chunks using the upload_id to identify the upload in progress and an offset representing the number of bytes transferred so far.
            3. After each chunk has been uploaded, the server returns a new offset representing the total amount transferred.
            4. After the last chunk, POST to /commit_chunked_upload to complete the upload.

         */
        throw new Error('chunked uploads NYI');
    }

    return through.obj(write);
};
