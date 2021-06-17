"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipLoadPromise = void 0;
const rnfs = require("react-native-fs");
const url_1 = require("url");
const UrlUtils_1 = require("../http/UrlUtils");
const zip_ex_1 = require("./zip-ex");
const zip_ex_http_1 = require("./zip-ex-http");
const zip1_1 = require("./zip1");
const zip2_1 = require("./zip2");
async function zipLoadPromise(filePath) {
    if (UrlUtils_1.isHTTP(filePath)) {
        const url = new url_1.URL(filePath);
        const p = url.pathname;
        if (p.endsWith("/")) {
            return zip_ex_http_1.ZipExplodedHTTP.loadPromise(filePath);
        }
        return zip2_1.Zip2.loadPromise(filePath);
    }
    const stats = await rnfs.stat(filePath);
    if (stats.isDirectory()) {
        return zip_ex_1.ZipExploded.loadPromise(filePath);
    }
    return zip1_1.Zip1.loadPromise(filePath);
}
exports.zipLoadPromise = zipLoadPromise;
//# sourceMappingURL=zipFactory.js.map