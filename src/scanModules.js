/**
 * @flow
 */

import path from 'path';
import fs from 'fs';
import isNpmModule from './DependencyGraph/isNpmModule';
import walk from 'fs-walk';
import Docblock from './DependencyGraph/docblock';
import DupeDefinitionError from './Error/DupeDefinitionError';
import InvalidDirectoryError from './Error/InvalidDirectoryError';
import Module from './Module';
import { waterfall, each } from 'async';

type ModuleScannerInitDataType = {
    rootDir: string|string[],
    files: string[],
};
type ModulesList = Map<string, Module>;

let modulesList: ModulesList = new Map();

const defaultExtensions = [
    '.js',
    '.json',
    '.es6',
    '.flow',
];

/**
 * Scan a directory and process every file under its root.
 *
 * @param {string} rootDir The directory to scan.
 * @param {ModulesList} curr The current modules list.
 * @param {(err: ?Object, m: ModulesList)} callback
 */
function processDirectory(
    rootDir: string,
    curr: ModulesList,
    callback: (err: ?Object, m: ModulesList) => void
): void {
    const parser = new Docblock();

    walk.files(rootDir, (basedir, filename, stat, nextFile) => {
        const file = path.resolve(path.join(basedir, filename));

        if(!defaultExtensions.includes(path.extname(file))) {
            nextFile();
            return;
        }

        Module.newFromFile(file, (err: ?Object, m: ?Module) => {
            if (err) {
                nextFile(err);
                return;
            }
            if (!m) {
                nextFile();
                return;
            }

            const moduleName = m.moduleName();

            if (modulesList.has(moduleName)) {
                nextFile(new DupeDefinitionError(modulesList.get(moduleName), m ));
                return;
            }

            modulesList.set(moduleName, m);
            nextFile();
        });
    }, (err) => {
        if (err) {
            callback(err);
            return;
        }
        callback(undefined, modulesList);
    });
}

/**
 * Scan modules with the given configuration.
 */
export default function scanModules({ rootDir, files }: ModuleScannerInitDataType): Promise<ModulesList> {
    if (typeof rootDir === 'string') {
        rootDir = [ rootDir ];
    }
    rootDir = rootDir.map(d => path.resolve(d));

    const parser = new Docblock();

    return new Promise((resolve, reject) => {
        rootDir.forEach(d => {
            const st = fs.statSync(d);
            if (!st.isDirectory()) {
                reject(new InvalidDirectoryError(d));
                return;
            }
        });

        waterfall([
            (next) => each(rootDir, (r: string, nextrootDir: Function) => {
                processDirectory(r, modulesList, (err: ?Object, m: ModulesList) => {
                    modulesList = new Map([
                        ...modulesList,
                        ...m
                    ]);

                    nextrootDir(err);
                });
            }, next),
            (next) => {
                if (!files) {
                    next();
                    return;
                }

                each(files, (file: string, nextFile: Function) => {
                    Module.newFromFile(file, (err: ?Object, m: ?Module) => {
                        if (err) {
                            nextFile(err);
                            return;
                        }
                        if (!m) {
                            nextFile();
                            return;
                        }

                        const moduleName = m.moduleName();

                        if (modulesList.hasOwnProperty(moduleName)) {
                            nextFile(new DupeDefinitionError(modulesList.get(moduleName), m ));
                            return;
                        }

                        modulesList.set(moduleName, m);
                        nextFile();
                    });
                }, next);
            },
        ], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(modulesList);
        });
    });
}
