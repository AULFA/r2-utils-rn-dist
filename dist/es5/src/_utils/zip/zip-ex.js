"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipExploded = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var path = require("path");
var rnfs = require("react-native-fs");
var stream_1 = require("stream");
var zip_1 = require("./zip");
var debug = debug_("r2:utils#zip/zip-ex");
var ZipExploded = (function (_super) {
    tslib_1.__extends(ZipExploded, _super);
    function ZipExploded(dirPath) {
        var _this = _super.call(this) || this;
        _this.dirPath = dirPath;
        return _this;
    }
    ZipExploded.loadPromise = function (dirPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, Promise.resolve(new ZipExploded(dirPath))];
            });
        });
    };
    ZipExploded.prototype.freeDestroy = function () {
        debug("freeDestroy: ZipExploded -- " + this.dirPath);
    };
    ZipExploded.prototype.entriesCount = function () {
        return 0;
    };
    ZipExploded.prototype.hasEntries = function () {
        return true;
    };
    ZipExploded.prototype.hasEntry = function (entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, rnfs.stat(path.join(this.dirPath, entryPath))];
                    case 1:
                        _a.sent();
                        return [2, this.hasEntries()];
                    case 2:
                        _1 = _a.sent();
                        return [2, false];
                    case 3: return [2];
                }
            });
        });
    };
    ZipExploded.prototype.getEntries = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2, new Promise(function (resolve, _reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var dirStats, dirPathNormalized, files, adjustedFiles;
                        var _this = this;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, rnfs.stat(this.dirPath)];
                                case 1:
                                    dirStats = _a.sent();
                                    dirPathNormalized = dirStats.originalFilepath;
                                    return [4, rnfs.readDir(this.dirPath)];
                                case 2:
                                    files = _a.sent();
                                    return [4, Promise.all(files.map(function (file) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                            var fileStats, filePathNormalized, relativeFilePath;
                                            return tslib_1.__generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, rnfs.stat(file.path)];
                                                    case 1:
                                                        fileStats = _a.sent();
                                                        filePathNormalized = fileStats.originalFilepath;
                                                        relativeFilePath = filePathNormalized.replace(dirPathNormalized, "");
                                                        debug(relativeFilePath);
                                                        if (relativeFilePath.indexOf("/") === 0) {
                                                            relativeFilePath = relativeFilePath.substr(1);
                                                        }
                                                        return [2, relativeFilePath];
                                                }
                                            });
                                        }); }))];
                                case 3:
                                    adjustedFiles = _a.sent();
                                    resolve(adjustedFiles);
                                    return [2];
                            }
                        });
                    }); })];
            });
        });
    };
    ZipExploded.prototype.entryStreamPromise = function (entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var hasEntry, fullPath, stats, content, contentStream, streamAndLength;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.hasEntry(entryPath)];
                    case 1:
                        hasEntry = _a.sent();
                        if (!this.hasEntries() || !hasEntry) {
                            return [2, Promise.reject("no such path in zip exploded: " + entryPath)];
                        }
                        fullPath = path.join(this.dirPath, entryPath);
                        return [4, rnfs.stat(fullPath)];
                    case 2:
                        stats = _a.sent();
                        return [4, rnfs.readFile(fullPath)];
                    case 3:
                        content = _a.sent();
                        contentStream = new stream_1.PassThrough();
                        contentStream.end(content);
                        streamAndLength = {
                            length: Number(stats.size),
                            reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    return [2, this.entryStreamPromise(entryPath)];
                                });
                            }); },
                            stream: contentStream,
                        };
                        return [2, Promise.resolve(streamAndLength)];
                }
            });
        });
    };
    return ZipExploded;
}(zip_1.Zip));
exports.ZipExploded = ZipExploded;
//# sourceMappingURL=zip-ex.js.map