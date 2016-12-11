/**
 * @flow
 */

const path = require('path');
const fs = require('fs');
const isNpmModule = require('./DependencyGraph/isNpmModule');
const walk = require('fs-walk');
const Docblock = require('./DependencyGraph/docblock');
const Module = require('./Module');
const waterfall = require('async').waterfall;
const each = require('async').each;

type ModuleScannerInitDataType = {
    root: string,
    files: string[],
};
type ModulesList = { [moduleName: string]: string };

/**
 * Process a file from the given path.
 *
 * @param  {Docblock} parser The docblock parser.
 * @param  {string} file The location of the file to parse
 * @param  {(err: ?Object, m: ?Module, hasModule: bool)} callback
 */
function processFile(
    parser: Docblock,
    file: string,
    callback: (err: ?Object, m: ?Module, hasModule: bool) => void
): void {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        const docs = parser.extract(data);
        const parsedDocs = parser.parseAsObject(docs);

        if (parsedDocs.hasOwnProperty('providesModule')) {
            const moduleName = parsedDocs.providesModule;
            const ignore = parsedDocs.hasOwnProperty('ignoreModule');

            const m = new Module({
                srcPath: file,
                moduleName,
                ignore,
            });

            callback(undefined, m, true);
        } else {
            callback(undefined, undefined, false);
        }
    });
}

/**
 * Scan modules with the given configuration.
 */
function scanModules({ root, files }: ModuleScannerInitDataType): Promise<ModulesList> {
    root = path.resolve(root);
    let modulesList: ModulesList = {};
    const parser = new Docblock();

    const rootStat = fs.statSync(root);
    if (!rootStat.isDirectory()) {
        throw new Error(`The provided path is not a directory: ${root}`);
    }

    return new Promise((resolve, reject) => {
        waterfall([
            (next) => walk.files(root, (basedir, filename, stat, nextFile) => {
                const file = path.resolve(path.join(basedir, filename));

                processFile(parser, file, (err: ?Object, m: ?Module, hasModule: ?bool) => {
                    if (err) {
                        nextFile(err);
                        return;
                    }
                    if (!hasModule) {
                        nextFile();
                        return;
                    }

                    const moduleName = m.moduleName();
                    const ignore = m.isIgnored();
                    const moduleSource = m.srcPath();

                    if (modulesList.hasOwnProperty(moduleName)) {
                        const originalSource = modulesList[moduleName];

                        nextFile(new Error(
                            `Duplicate definition of "${moduleName}" found in ${original} and ${moduleName}.`
                        ));
                        return;
                    }

                    modulesList[moduleName] = file;
                    nextFile();
                });
            }, (err) => {
                if (err) {
                    next(err);
                    return;
                }
                next();
            }),
            (next) => {
                if (!files) {
                    next();
                    return;
                }

                each(files, (file: string, nextFile: Function) => {
                    processFile(parser, file, (err: ?Object, m: ?Module, hasModule: ?bool) => {
                        if (err) {
                            nextFile(err);
                            return;
                        }
                        if (!hasModule) {
                            nextFile();
                            return;
                        }

                        const moduleName = m.moduleName();
                        const ignore = m.isIgnored();
                        const moduleSource = m.srcPath();

                        if (modulesList.hasOwnProperty(moduleName)) {
                            const originalSource = modulesList[moduleName];

                            nextFile(new Error(
                                `Duplicate definition of "${moduleName}" found in ${original} and ${moduleName}.`
                            ));
                            return;
                        }

                        nextFile();
                        modulesList[moduleName] = file;
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

module.exports = scanModules;
