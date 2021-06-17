"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipExploded = void 0;
const tslib_1 = require("tslib");
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
    static loadPromise(dirPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(new ZipExploded(dirPath));
        });
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
    hasEntry(entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield rnfs.stat(path.join(this.dirPath, entryPath));
                return this.hasEntries();
            }
            catch (_) {
                return false;
            }
        });
    }
    getEntries() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, _reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const dirStats = yield rnfs.stat(this.dirPath);
                const dirPathNormalized = dirStats.originalFilepath;
                const files = yield rnfs.readDir(this.dirPath);
                const adjustedFiles = yield Promise.all(files.map((file) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const fileStats = yield rnfs.stat(file.path);
                    const filePathNormalized = fileStats.originalFilepath;
                    let relativeFilePath = filePathNormalized.replace(dirPathNormalized, "");
                    debug(relativeFilePath);
                    if (relativeFilePath.indexOf("/") === 0) {
                        relativeFilePath = relativeFilePath.substr(1);
                    }
                    return relativeFilePath;
                })));
                resolve(adjustedFiles);
            }));
        });
    }
    entryStreamPromise(entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const hasEntry = yield this.hasEntry(entryPath);
            if (!this.hasEntries() || !hasEntry) {
                return Promise.reject("no such path in zip exploded: " + entryPath);
            }
            const fullPath = path.join(this.dirPath, entryPath);
            const stats = yield rnfs.stat(fullPath);
            const content = yield rnfs.readFile(fullPath);
            const contentStream = new stream_1.PassThrough();
            contentStream.end(content);
            const streamAndLength = {
                length: Number(stats.size),
                reset: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return this.entryStreamPromise(entryPath);
                }),
                stream: contentStream,
            };
            return Promise.resolve(streamAndLength);
        });
    }
}
exports.ZipExploded = ZipExploded;
//# sourceMappingURL=zip-ex.js.map