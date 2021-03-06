import { IStreamAndLength, IZip, Zip } from "./zip";
export declare class Zip3 extends Zip {
    readonly filePath: string;
    readonly zip: any;
    static loadPromise(filePath: string): Promise<IZip>;
    private static loadPromiseHTTP;
    private entries;
    private constructor();
    freeDestroy(): void;
    entriesCount(): number;
    hasEntries(): boolean;
    hasEntry(entryPath: string): Promise<boolean>;
    getEntries(): Promise<string[]>;
    entryStreamPromise(entryPath: string): Promise<IStreamAndLength>;
}
