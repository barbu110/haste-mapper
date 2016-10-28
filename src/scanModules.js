/**
 * @flow
 */

const path = require('path');
const fs = require('fs');
const isNpmModule = require('./DependencyGraph/isNpmModule');
const walk = require('fs-walk');
const Docblock = require('./DependencyGraph/docblock');

type ModuleScannerInitDataType = {
    root: string,
};
type ModulesList = { [moduleName: string]: string };

function scanModules({ root }: ModuleScannerInitDataType): Promise<ModulesList> {
    root = path.resolve(root);
    let modulesList: ModulesList = {};

    const rootStat = fs.statSync(root);
    if (!rootStat.isDirectory()) {
        throw new Error(`The provided path is invalid: ${root}`);
    }

    return new Promise((resolve, reject) => {
        walk.files(root, (basedir, filename, stat, next) => {
            const file = path.resolve(path.join(basedir, filename));
            const parser = new Docblock();

            fs.readFile(file, 'utf8', (err, data) => {
                if (err) {
                    throw err;
                }

                const docs = parser.extract(data);
                const parsedData = parser.parseAsObject(docs);

                if (parsedData.hasOwnProperty('providesModule')) {
                    const moduleName = parsedData.providesModule;

                    if (modulesList.hasOwnProperty(moduleName)) {
                        const original = modulesList[moduleName];

                        return reject(new Error(`Duplicate definition of "${moduleName}" found in ${original} and ${moduleName}.`));
                    }

                    modulesList[moduleName] = file;
                }
            });

            next();
        }, (err) => {
            if (err) {
                reject(err);
            }
            resolve(modulesList);
        });
    });
}

module.exports = scanModules;
