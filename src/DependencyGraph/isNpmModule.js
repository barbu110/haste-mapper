/**
 * @flow
 */

/**
 * Check whether a module name can be resolved as
 * an NPM module.
 *
 * @param {string} moduleName
 * @return {boolean}
 */
function isNpmModule(moduleName: string): boolean {
    try {
        require.resolve(moduleName);
        return true;
    } catch(e) {
        return false;
    }
}

module.exports = isNpmModule;
