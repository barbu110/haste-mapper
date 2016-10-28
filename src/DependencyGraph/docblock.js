/**
 * @flow
 */

const path = require('path');
const fs = require('fs');

const docblockRe = /^\s*(\/\*\*(.|\r?\n)*?\*\/)/;
const ltrimRe = /^\s*/;

var commentStartRe = /^\/\*\*/;
var commentEndRe = /\*\/$/;
var wsRe = /[\t ]+/g;
var stringStartRe = /(\r?\n|^) *\*/g;
var multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
var propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

class Docblock {
    constructor() {
    }

    /**
     * Extract the first docblock comment from a file.
     *
     * @param {string} contents
     * @return {string}
     */
    extract(contents: string): string {
        const match = contents.match(docblockRe);

        if (match) {
            return match[0].replace(ltrimRe, '') || '';
        }
        return '';
    }

    /**
     * Parse the docblock properties in form of pairs.
     *
     * @return {string[][]} Pairs of [ propName, propValue ].
     */
    parse(docblock: string): Array<string[]> {
        docblock = docblock
            .replace(commentStartRe, '')
            .replace(commentEndRe, '')
            .replace(wsRe, ' ')
            .replace(stringStartRe, '$1');

        let prev = '';
        while (prev !== docblock) {
            prev = docblock;
            docblock = docblock.replace(multilineRe, '\n$1 $2\n');
        }
        docblock = docblock.trim();

        var result = [];
        var match;
        while ((match = propertyRe.exec(docblock))) {
            result.push([ match[1], match[2] ]);
        }

        return result;
    }

    /**
     * Same as parse(), but returns an object of `{ propName: propValue }` form.
     *
     * @return {{ [propName: string]: string }}
     */
    parseAsObject(docblock: string): { [propName: string]: string } {
        const pairs = this.parse(docblock);
        let result = {};

        for (let i = 0; i < pairs.length; i++) {
            result[pairs[i][0]] = pairs[i][1];
        }
        return result;
    }

}

module.exports = Docblock;
