/**
 * @flow
 */

const replacePatterns = require('./replacePatterns');

const blockCommentRe = /\/\*[^]*?\*\//g;
const lineCommentRe = /\/\/.*/g;

/**
 * Extract the direct dependencies of a module.
 *
 * @param  {string} code: string The code of the module.
 * @return {{code: string, deps: Object}} Returns the code with
 * comments stripped and the found dependencies.
 */
function extractRequires(code: string): { code: string, deps: Object } {
    const cache: { [dep: string]: bool } = Object.create(null);
    const deps = {
        sync: [],
    };

    const addDependency = (dep: string) => {
        if (!cache[dep]) {
            cache[dep] = true;
            deps.sync.push(dep);
        }
    };

    code = code
        .replace(blockCommentRe, '')
        .replace(lineCommentRe, '')
        .replace(replacePatterns.IMPORT_RE, (match, pre, quot, dep: string, post) => {
            addDependency(dep);
            return match;
        })
        .replace(replacePatterns.EXPORT_RE, (match, pre, quot, dep: string, post) => {
            addDependency(dep);
            return match;
        })
        .replace(replacePatterns.REQUIRE_RE, (match, pre, quot, dep: string, post) => {
            addDependency(dep);
            return match;
        });

    return { code, deps };
}

module.exports = extractRequires;
