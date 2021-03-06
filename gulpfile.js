'use strict';

var gulp   = require('gulp');
var plugins = require('gulp-load-plugins')();

var paths = {
  lint: ['./gulpfile.js', './lib/**/*.js'],
  watch: ['./gulpfile.js', './lib/**', './test/**/*.js', '!test/{temp,temp/**}'],
  tests: ['./test/**/*.js', '!test/{temp,temp/**}']
};

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('unitTest', function () {
  gulp.src(paths.tests, {cwd: __dirname})
    .pipe(plugins.plumber())
    .pipe(plugins.mocha({ reporter: 'list' }));
});

gulp.task('watch', ['test'], function () {
  gulp.watch(paths.watch, ['test']);
});

gulp.task('test', ['lint', 'unitTest']);

gulp.task('default', ['test']);
