/**
 * @flow
 */

import type Module from '../Module';

export default class DupeDefinitionError extends Error {
    constructor(original: Module, dupe: Module) {
        const originalModuleName = original.moduleName();
        const origSource = original.moduleSource();
        const dupeSource = dupe.moduleSource();
        const message = `Duplicate definition of ${originalModuleName} found in ${origSource} and ${dupeSource}.`;

        super(message);

        this.name = this.constructor.name;
        this.message = message;

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
