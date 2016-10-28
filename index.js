/**
 * @flow
 */

const scanModules = require('./src/scanModules');

const root = process.argv[2];

scanModules({ root }).then((data) => {
    console.log(data);
});


