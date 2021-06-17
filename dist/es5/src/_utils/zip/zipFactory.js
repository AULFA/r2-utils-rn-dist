"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipLoadPromise = void 0;
var tslib_1 = require("tslib");
var rnfs = require("react-native-fs");
var url_1 = require("url");
var UrlUtils_1 = require("../http/UrlUtils");
var zip_ex_1 = require("./zip-ex");
var zip_ex_http_1 = require("./zip-ex-http");
var zip1_1 = require("./zip1");
var zip2_1 = require("./zip2");
function zipLoadPromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var url, p, stats;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (UrlUtils_1.isHTTP(filePath)) {
                        url = new url_1.URL(filePath);
                        p = url.pathname;
                        if (p.endsWith("/")) {
                            return [2, zip_ex_http_1.ZipExplodedHTTP.loadPromise(filePath)];
                        }
                        return [2, zip2_1.Zip2.loadPromise(filePath)];
                    }
                    return [4, rnfs.stat(filePath)];
                case 1:
                    stats = _a.sent();
                    if (stats.isDirectory()) {
                        return [2, zip_ex_1.ZipExploded.loadPromise(filePath)];
                    }
                    return [2, zip1_1.Zip1.loadPromise(filePath)];
            }
        });
    });
}
exports.zipLoadPromise = zipLoadPromise;
//# sourceMappingURL=zipFactory.js.map