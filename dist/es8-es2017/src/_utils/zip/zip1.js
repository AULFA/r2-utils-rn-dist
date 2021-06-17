"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zip1 = void 0;
const debug_ = require("debug");
const JSZip = require("jszip");
const rnfs = require("react-native-fs");
const stream_1 = require("stream");
const zip_1 = require("./zip");
const debug = debug_("r2:utils#zip/zip1");
class Zip1 extends zip_1.Zip {
    constructor(filePath, zip) {
        super();
        this.filePath = filePath;
        this.zip = zip;
    }
    static async loadPromise(filePath) {
        const fileContent = await rnfs.readFile(filePath, "base64");
        const zip = await new JSZip().loadAsync(fileContent, { base64: true });
        return new Zip1(filePath, zip);
    }
    freeDestroy() {
        debug("freeDestroy: Zip1 -- " + this.filePath);
    }
    entriesCount() {
        return Object.keys(this.zip.files).length;
    }
    hasEntries() {
        return this.entriesCount() > 0;
    }
    async hasEntry(entryPath) {
        return this.hasEntries() && this.zip.file(entryPath) != null;
    }
    async getEntries() {
        if (!this.hasEntries()) {
            return Promise.resolve([]);
        }
        return Promise.resolve(Object.keys(this.zip.files));
    }
    async entryStreamPromise(entryPath) {
        if (!this.hasEntries() || !this.hasEntry(entryPath)) {
            return Promise.reject("no such path in zip: " + entryPath);
        }
        const entry = this.zip.file(entryPath);
        const content = await entry.async("text");
        const contentStream = new stream_1.PassThrough();
        contentStream.end(content);
        return {
            length: content.length,
            reset: async () => {
                return this.entryStreamPromise(entryPath);
            },
            stream: contentStream,
        };
    }
}
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map