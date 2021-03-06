"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectFileInZip = exports.injectBufferInZip = exports.injectStreamInZip = void 0;
const debug_ = require("debug");
const rnfs = require("react-native-fs");
const yauzl = require("yauzl");
const yazl = require("yazl");
const debug = debug_("r2:utils#zip/zipInjector");
var InjectType;
(function (InjectType) {
    InjectType[InjectType["FILE"] = 0] = "FILE";
    InjectType[InjectType["BUFFER"] = 1] = "BUFFER";
    InjectType[InjectType["STREAM"] = 2] = "STREAM";
})(InjectType || (InjectType = {}));
function injectStreamInZip(destPathTMP, destPathFINAL, stream, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, stream, InjectType.STREAM, zipEntryPath, zipError, doneCallback);
}
exports.injectStreamInZip = injectStreamInZip;
function injectBufferInZip(destPathTMP, destPathFINAL, buffer, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, buffer, InjectType.BUFFER, zipEntryPath, zipError, doneCallback);
}
exports.injectBufferInZip = injectBufferInZip;
function injectFileInZip(destPathTMP, destPathFINAL, filePath, zipEntryPath, zipError, doneCallback) {
    injectObjectInZip(destPathTMP, destPathFINAL, filePath, InjectType.FILE, zipEntryPath, zipError, doneCallback);
}
exports.injectFileInZip = injectFileInZip;
function injectObjectInZip(destPathTMP, destPathFINAL, contentsToInject, typeOfContentsToInject, zipEntryPath, zipError, doneCallback) {
    yauzl.open(destPathTMP, { lazyEntries: true, autoClose: false }, (err, zip) => {
        if (err || !zip) {
            debug("yauzl init ERROR");
            zipError(err);
            return;
        }
        const zipfile = new yazl.ZipFile();
        zip.on("error", (erro) => {
            debug("yauzl ERROR");
            zipError(erro);
        });
        zip.readEntry();
        zip.on("entry", (entry) => {
            if (entry.fileName[entry.fileName.length - 1] === "/") {
            }
            else if (entry.fileName === zipEntryPath) {
            }
            else {
                zip.openReadStream(entry, (errz, stream) => {
                    if (err || !stream) {
                        debug("yauzl openReadStream ERROR");
                        debug(errz);
                        zipError(errz);
                        return;
                    }
                    const compress = entry.fileName !== "mimetype";
                    zipfile.addReadStream(stream, entry.fileName, { compress });
                });
            }
            zip.readEntry();
        });
        zip.on("end", () => {
            debug("yauzl END");
            process.nextTick(() => {
                zip.close();
            });
            if (typeOfContentsToInject === InjectType.FILE) {
                zipfile.addFile(contentsToInject, zipEntryPath);
            }
            else if (typeOfContentsToInject === InjectType.BUFFER) {
                zipfile.addBuffer(contentsToInject, zipEntryPath);
            }
            else if (typeOfContentsToInject === InjectType.STREAM) {
                zipfile.addReadStream(contentsToInject, zipEntryPath);
            }
            else {
                debug("yazl FAIL to inject! (unknown type)");
            }
            zipfile.end();
            const zipContent = zipfile.outputStream.read();
            if (zipContent != null) {
                rnfs.writeFile(destPathFINAL, zipContent.toString())
                    .then(() => {
                    doneCallback();
                })
                    .catch((ere) => {
                    zipError(ere);
                });
            }
            else {
                zipError("zip file stream content is null");
            }
        });
        zip.on("close", () => {
            debug("yauzl CLOSE");
        });
    });
}
//# sourceMappingURL=zipInjector.js.map