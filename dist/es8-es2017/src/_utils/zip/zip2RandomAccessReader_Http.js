"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpZipReader = void 0;
const debug_ = require("debug");
const follow_redirects_1 = require("follow-redirects");
const stream_1 = require("stream");
const yauzl = require("yauzl");
const BufferUtils_1 = require("../stream/BufferUtils");
const debug = debug_("r2:utils#zip/zip2RandomAccessReader_Http");
class HttpZipReader extends yauzl.RandomAccessReader {
    constructor(url, byteLength) {
        super();
        this.url = url;
        this.byteLength = byteLength;
        this.firstBuffer = undefined;
        this.firstBufferStart = 0;
        this.firstBufferEnd = 0;
    }
    _readStreamForRange(start, end) {
        if (this.firstBuffer && start >= this.firstBufferStart && end <= this.firstBufferEnd) {
            const begin = start - this.firstBufferStart;
            const stop = end - this.firstBufferStart;
            return BufferUtils_1.bufferToStream(this.firstBuffer.slice(begin, stop));
        }
        const stream = new stream_1.PassThrough();
        const lastByteIndex = end - 1;
        const range = `${start}-${lastByteIndex}`;
        const failure = (err) => {
            debug(err);
        };
        const success = async (res) => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                failure("HTTP CODE " + res.statusCode);
                return;
            }
            if (this.firstBuffer) {
                res.pipe(stream);
            }
            else {
                let buffer;
                try {
                    buffer = await BufferUtils_1.streamToBufferPromise(res);
                }
                catch (err) {
                    debug(err);
                    stream.end();
                    return;
                }
                debug(`streamToBufferPromise: ${buffer.length}`);
                this.firstBuffer = buffer;
                this.firstBufferStart = start;
                this.firstBufferEnd = end;
                stream.write(buffer);
                stream.end();
            }
        };
        follow_redirects_1.http.get(Object.assign(Object.assign({}, new URL(this.url)), { headers: { Range: `bytes=${range}` } }))
            .on("response", success)
            .on("error", failure);
        return stream;
    }
}
exports.HttpZipReader = HttpZipReader;
//# sourceMappingURL=zip2RandomAccessReader_Http.js.map