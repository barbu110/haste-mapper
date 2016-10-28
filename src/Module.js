/**
 * @flow
 */

const crypto = require('crypto');
const docblock = require('./DependencyGraph/docblock');
const path = require('path');

type ModuleDataType = {
    srcPath: string,
    moduleName: string,
}

class Module {
    _moduleName: string;
    _srcPath: string;

    constructor({ srcPath, moduleName }: ModuleDataType) {
        this._moduleName = moduleName;
        this._srcPath = srcPath;
    }

    moduleName(): string {
        return this._moduleName;
    }

    srcPath(): string {
        return this._srcPath;
    }
}

module.exports = Module;
