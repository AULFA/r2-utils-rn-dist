"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zip1 = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var JSZip = require("jszip");
var rnfs = require("react-native-fs");
var stream_1 = require("stream");
var zip_1 = require("./zip");
var debug = debug_("r2:utils#zip/zip1");
var Zip1 = (function (_super) {
    tslib_1.__extends(Zip1, _super);
    function Zip1(filePath, zip) {
        var _this = _super.call(this) || this;
        _this.filePath = filePath;
        _this.zip = zip;
        return _this;
    }
    Zip1.loadPromise = function (filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fileContent, zip;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, rnfs.readFile(filePath, "base64")];
                    case 1:
                        fileContent = _a.sent();
                        return [4, new JSZip().loadAsync(fileContent, { base64: true })];
                    case 2:
                        zip = _a.sent();
                        return [2, new Zip1(filePath, zip)];
                }
            });
        });
    };
    Zip1.prototype.freeDestroy = function () {
        debug("freeDestroy: Zip1 -- " + this.filePath);
    };
    Zip1.prototype.entriesCount = function () {
        return Object.keys(this.zip.files).length;
    };
    Zip1.prototype.hasEntries = function () {
        return this.entriesCount() > 0;
    };
    Zip1.prototype.hasEntry = function (entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, this.hasEntries() && this.zip.file(entryPath) != null];
            });
        });
    };
    Zip1.prototype.getEntries = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this.hasEntries()) {
                    return [2, Promise.resolve([])];
                }
                return [2, Promise.resolve(Object.keys(this.zip.files))];
            });
        });
    };
    Zip1.prototype.entryStreamPromise = function (entryPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var entry, content, contentStream;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasEntries() || !this.hasEntry(entryPath)) {
                            return [2, Promise.reject("no such path in zip: " + entryPath)];
                        }
                        entry = this.zip.file(entryPath);
                        return [4, entry.async("text")];
                    case 1:
                        content = _a.sent();
                        contentStream = new stream_1.PassThrough();
                        contentStream.end(content);
                        return [2, {
                                length: content.length,
                                reset: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    return tslib_1.__generator(this, function (_a) {
                                        return [2, this.entryStreamPromise(entryPath)];
                                    });
                                }); },
                                stream: contentStream,
                            }];
                }
            });
        });
    };
    return Zip1;
}(zip_1.Zip));
exports.Zip1 = Zip1;
//# sourceMappingURL=zip1.js.map