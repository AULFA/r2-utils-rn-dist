"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipExploded = void 0;
const debug_ = require("debug");
const path = require("path");
const rnfs = require("react-native-fs");
const stream_1 = require("stream");
const zip_1 = require("./zip");
const debug = debug_("r2:utils#zip/zip-ex");
class ZipExploded extends zip_1.Zip {
    constructor(dirPath) {
        super();
        this.dirPath = dirPath;
    }
    static async loadPromise(dirPath) {
        return Promise.resolve(new ZipExploded(dirPath));
    }
    freeDestroy() {
        debug("freeDestroy: ZipExploded -- " + this.dirPath);
    }
    entriesCount() {
        return 0;
    }
    hasEntries() {
        return true;
    }
    async hasEntry(entryPath) {
        try {
            await rnfs.stat(path.join(this.dirPath, entryPath));
            return this.hasEntries();
        }
        catch (_) {
            return false;
        }
    }
    async getEntries() {
        return new Promise(async (resolve, _reject) => {
            const dirStats = await rnfs.stat(this.dirPath);
            const dirPathNormalized = dirStats.originalFilepath;
            const files = await rnfs.readDir(this.dirPath);
            const adjustedFiles = await Promise.all(files.map(async (file) => {
                const fileStats = await rnfs.stat(file.path);
                const filePathNormalized = fileStats.originalFilepath;
                let relativeFilePath = filePathNormalized.replace(dirPathNormalized, "");
                debug(relativeFilePath);
                if (relativeFilePath.indexOf("/") === 0) {
                    relativeFilePath = relativeFilePath.substr(1);
                }
                return relativeFilePath;
            }));
            resolve(adjustedFiles);
        });
    }
    async entryStreamPromise(entryPath) {
        const hasEntry = await this.hasEntry(entryPath);
        if (!this.hasEntries() || !hasEntry) {
            return Promise.reject("no such path in zip exploded: " + entryPath);
        }
        const fullPath = path.join(this.dirPath, entryPath);
        const stats = await rnfs.stat(fullPath);
        const content = await rnfs.readFile(fullPath);
        const contentStream = new stream_1.PassThrough();
        contentStream.end(content);
        const streamAndLength = {
            length: Number(stats.size),
            reset: async () => {
                return this.entryStreamPromise(entryPath);
            },
            stream: contentStream,
        };
        return Promise.resolve(streamAndLength);
    }
}
exports.ZipExploded = ZipExploded;
//# sourceMappingURL=zip-ex.js.map