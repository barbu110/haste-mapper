/**
 * @flow
 */

import crypto from 'crypto';
import Docblock from './DependencyGraph/docblock';
import path from 'path';
import fs from 'fs';

const commentsParser = new Docblock();

type ModuleDataType = {
    srcPath: string,
    moduleName: string,
    ignore: boolean,
};

export default class Module {
    _moduleName: string;
    _srcPath: string;
    _ignore: boolean;

    constructor({ srcPath, moduleName, ignore }: ModuleDataType) {
        this._moduleName = moduleName;
        this._srcPath = srcPath;
        this._ignore = ignore;
    }

    moduleName(): string {
        return this._moduleName;
    }

    srcPath(): string {
        return this._srcPath;
    }

    isIgnored(): boolean {
        return this._ignore;
    }

    /**
     * Parse the given file and get the module.
     *
     * @param {string} file
     * @param {(err: ?Object, m: ?Module)} callback
     */
    static newFromFile(file: string, callback: (err: ?Object, m: ?Module) => void): void {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                callback(err);
                return;
            }

            const docs = commentsParser.extract(data);
            const parsedDocs = commentsParser.parseAsObject(docs);

            if (!parsedDocs.hasOwnProperty('providesModule')) {
                callback();
                return;
            }

            callback(undefined, new Module({
                srcPath: file,
                moduleName: parsedDocs.providesModule,
                ignore: parsedDocs.hasOwnProperty('ignoreModule'),
            }));
        });
    }
}
