"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipExplodedHTTP = void 0;
const debug_ = require("debug");
const follow_redirects_1 = require("follow-redirects");
const stream_1 = require("stream");
const url_1 = require("url");
const zip_1 = require("./zip");
const debug = debug_("r2:utils#zip/zip-ex-http");
class ZipExplodedHTTP extends zip_1.Zip {
    constructor(urlStr) {
        super();
        this.urlStr = urlStr;
        debug(`ZipExplodedHTTP: ${urlStr}`);
    }
    static async loadPromise(urlStr) {
        return Promise.resolve(new ZipExplodedHTTP(urlStr));
    }
    freeDestroy() {
        debug("freeDestroy: ZipExplodedHTTP -- " + this.urlStr);
    }
    entriesCount() {
        return 0;
    }
    hasEntries() {
        return true;
    }
    async hasEntry(entryPath) {
        debug(`hasEntryAsync: ${entryPath}`);
        const url = new url_1.URL(this.urlStr);
        url.pathname += entryPath;
        const urlStrEntry = url.toString();
        debug("urlStrEntry: ", urlStrEntry);
        return new Promise(async (topresolve, _topreject) => {
            const failure = async (err) => {
                debug(err);
                topresolve(false);
            };
            const success = async (response) => {
                if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                    topresolve(false);
                    return;
                }
                topresolve(true);
            };
            const promise = new Promise((resolve, reject) => {
                follow_redirects_1.http.request(Object.assign(Object.assign({}, new url_1.URL(urlStrEntry)), { headers: {}, method: "HEAD" }))
                    .on("response", async (response) => {
                    await success(response);
                    resolve();
                })
                    .on("error", async (err) => {
                    await failure(err);
                    reject();
                })
                    .end();
            });
            try {
                await promise;
            }
            catch (err) {
            }
        });
    }
    async getEntries() {
        return new Promise(async (_resolve, reject) => {
            reject("Not implemented.");
        });
    }
    async entryStreamPromise(entryPath) {
        debug(`entryStreamPromise: ${entryPath}`);
        const url = new url_1.URL(this.urlStr);
        url.pathname += entryPath;
        const urlStrEntry = url.toString();
        debug("urlStrEntry: ", urlStrEntry);
        return new Promise(async (topresolve, topreject) => {
            const failure = async (err) => {
                debug(err);
                topreject(err);
            };
            const success = async (response) => {
                if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                    await failure("HTTP CODE " + response.statusCode);
                    return;
                }
                let length = 0;
                const lengthStr = response.headers["content-length"];
                if (lengthStr) {
                    length = parseInt(lengthStr, 10);
                }
                const stream = new stream_1.PassThrough();
                response.pipe(stream);
                const streamAndLength = {
                    length,
                    reset: async () => {
                        return this.entryStreamPromise(entryPath);
                    },
                    stream,
                };
                topresolve(streamAndLength);
            };
            const promise = new Promise((resolve, reject) => {
                follow_redirects_1.http.get(Object.assign(Object.assign({}, new url_1.URL(urlStrEntry)), { headers: {} }))
                    .on("response", async (response) => {
                    await success(response);
                    resolve();
                })
                    .on("error", async (err) => {
                    await failure(err);
                    reject();
                });
            });
            try {
                await promise;
            }
            catch (err) {
            }
        });
    }
}
exports.ZipExplodedHTTP = ZipExplodedHTTP;
//# sourceMappingURL=zip-ex-http.js.map