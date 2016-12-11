/**
 * @flow
 */

const crypto = require('crypto');
const Docblock = require('./DependencyGraph/docblock');
const path = require('path');
const fs = require('fs');

type ModuleDataType = {
    srcPath: string,
    moduleName: string,
    ignore: boolean,
}

class Module {
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
}

module.exports = Module;
