"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zip3 = void 0;
const debug_ = require("debug");
const follow_redirects_1 = require("follow-redirects");
const unzipper = require("unzipper");
const UrlUtils_1 = require("../http/UrlUtils");
const zip_1 = require("./zip");
const debug = debug_("r2:utils#zip/zip3");
class Zip3 extends zip_1.Zip {
    constructor(filePath, zip) {
        super();
        this.filePath = filePath;
        this.zip = zip;
        this.entries = {};
        this.zip.files.forEach((file) => {
            this.entries[file.path] = file;
        });
    }
    static async loadPromise(filePath) {
        if (UrlUtils_1.isHTTP(filePath)) {
            return Zip3.loadPromiseHTTP(filePath);
        }
        return new Promise(async (resolve, reject) => {
            let zip;
            try {
                zip = await unzipper.Open.file(filePath);
            }
            catch (err) {
                debug(err);
                reject(err);
                return;
            }
            debug(zip);
            resolve(new Zip3(filePath, zip));
        });
    }
    static async loadPromiseHTTP(filePath) {
        return new Promise(async (resolve, reject) => {
            let zip;
            try {
                zip = await unzipper.Open.url(follow_redirects_1.http.get, Object.assign(Object.assign({}, new URL(filePath)), { headers: {} }));
            }
            catch (err) {
                debug(err);
                reject(err);
                return;
            }
            debug(zip);
            resolve(new Zip3(filePath, zip));
        });
    }
    freeDestroy() {
        debug("freeDestroy: Zip3 -- " + this.filePath);
        if (this.zip) {
        }
    }
    entriesCount() {
        return this.zip.files.length;
    }
    hasEntries() {
        return this.entriesCount() > 0;
    }
    async hasEntry(entryPath) {
        return this.hasEntries() && this.entries[entryPath];
    }
    async getEntries() {
        if (!this.hasEntries()) {
            return Promise.resolve([]);
        }
        return Promise.resolve(Object.keys(this.entries));
    }
    async entryStreamPromise(entryPath) {
        if (!this.hasEntries() || !this.hasEntry(entryPath)) {
            return Promise.reject("no such path in zip: " + entryPath);
        }
        return new Promise((resolve, _reject) => {
            const entry = this.entries[entryPath];
            debug(entry);
            const stream = entry.stream();
            const streamAndLength = {
                length: entry.size,
                reset: async () => {
                    return this.entryStreamPromise(entryPath);
                },
                stream,
            };
            resolve(streamAndLength);
        });
    }
}
exports.Zip3 = Zip3;
//# sourceMappingURL=zip3.js.map