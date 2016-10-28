/**
 * @flow
 */

module.exports.IMPORT_RE = /(\bimport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
module.exports.EXPORT_RE = /(\bexport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)/g;
module.exports.REQUIRE_RE = /(\brequire\s*?\(\s*?)(['"`])([^'"`]+)(\2\s*?\))/g;
