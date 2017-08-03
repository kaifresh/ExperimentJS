// // npm install gulp browserify babelify vinyl-source-stream --save-dev
//
// var gulp = require('gulp');
// var browserify = require('browserify');
// var babelify = require('babelify');
// var source = require('vinyl-source-stream');
//
// gulp.task('dist', function () {
//     return browserify({entries: './src/ExperimentJS.js', extensions: ['.js'], debug: true})
//         .transform(babelify)
//         .bundle()
//         .pipe(source('bundle.js'))
//         .pipe(gulp.dest('dist'));
// });
//
// gulp.task('watch', ['dist'], function () {
//     gulp.watch('*.js', ['dist']);
// });
//
// gulp.task('default', ['watch']);

// ================================================================


// npm i -D gulp gulp-sourcemaps vinyl-source-stream vinyl-buffer browserify watchify babelify
//
// var gulp = require('gulp');
// var sourcemaps = require('gulp-sourcemaps');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var browserify = require('browserify');
// var watchify = require('watchify');
// var babel = require('babelify');
//
// function compile(watch) {
//     var bundler = watchify(browserify('./src/ExperimentJS.js', { debug: true }).transform(babel));
//
//     function rebundle() {
//         bundler.bundle()
//             .on('error', function(err) { console.error(err); this.emit('end'); })
//             .pipe(source('dist.js'))
//             .pipe(buffer())
//             .pipe(sourcemaps.init({ loadMaps: true }))
//             .pipe(sourcemaps.write('./'))
//             .pipe(gulp.dest('./dist'));
//     }
//
//     if (watch) {
//         bundler.on('update', function() {
//             console.log('-> bundling...');
//             rebundle();
//         });
//     }
//
//     rebundle();
// }
//
// function watch() {
//     return compile(true);
// };
//
// gulp.task('dist', function() { return compile(); });
// gulp.task('watch', function() { return watch(); });
//
// gulp.task('default', ['watch']);

// ================================================================

var gulp = require('gulp');
var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');

// Lets bring es6 to es5 with this.
// Babel - converts ES6 code to ES5 - however it doesn't handle imports.
// Browserify - crawls your code for dependencies and packages them up
// into one file. can have plugins.
// Babelify - a babel plugin for browserify, to make browserify
// handle es6 including imports.
gulp.task('es6', function() {
    browserify({ debug: true })
        .transform(babelify)
        .require("./src/ExperimentJS.js", { entry: true })
        .bundle()
        .on('error',gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch',function() {
    gulp.watch(['./app/**/*.js'],['es6'])
});

gulp.task('default', ['es6','watch']);