/**
 * @flow
 */

export default class InvalidDirectoryError extends Error {
    constructor(path: string) {
        const originalModuleName = original.moduleName();
        const origSource = original.moduleSource();
        const dupeSource = dupe.moduleSource();
        const message = `The provided path is not a directory: "${path}"`;

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
