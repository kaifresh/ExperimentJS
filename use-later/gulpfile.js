/**
 * Created by kai on 9/8/16.
 */
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var gulp   = require('gulp');

gulp.task('lint', function() {
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});
