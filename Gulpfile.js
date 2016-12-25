const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('babel-core');
const walk = require('fs-walk');
const path = require('path');
const fs = require('fs-extra');
const each = require('async').each;
const waterfall = require('async').waterfall;

function scanSourceFiles() {
    const root = path.resolve(path.join(__dirname, 'src'));
    let filelist = [];

    return new Promise((resolve, reject) => {
        walk.files(root, (basedir, filename, stat, next) => {
            const file = path.resolve(path.join(basedir, filename));

            filelist.push(file);
            next();
        }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(filelist);
        });
    });
}

const babelOptions = {
    comments: false,
    extends: path.resolve(path.join(__dirname, '.babelrc')),
};

gulp.task('build', done => {
    waterfall([
        (next) => {
            scanSourceFiles().then((filelist) => next(undefined, filelist));
        },
        (filelist, next) => each(filelist, (file, callback) => {
            waterfall([
                (next) => babel.transformFile(file, babelOptions, (err, result) => {
					console.log(`Processing file ${file}...`);
                    file = file.replace(/\/src\//g, '/build/');

                    if (err) {
                        console.log(err);
                    }

					next(undefined, file, result.code);
                }),
                (file, code, next) => fs.createFile(file, err => next(err, file, code)),
                (file, code, next) => fs.writeFile(file, code, next),
            ], callback);
        }, next),
    ], done);
});
