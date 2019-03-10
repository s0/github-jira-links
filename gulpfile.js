var gulp = require('gulp');
var clean = require('gulp-clean');
var gutil = require("gulp-util");
var ts = require('gulp-typescript');
var tslint = require('tslint');
var gulpTslint = require('gulp-tslint');
var runSequence = require('run-sequence');
var webpack = require('webpack');

var tsProject = ts.createProject('src/tsconfig.json');

// Utility Functions

function handleError(err) {
  gutil.log("Build failed", err.message);
  process.exit(1);
}

gulp.task('clean', function() {
  return gulp.src(['.tmp', 'dist'], {read: false})
        .pipe(clean());
});

gulp.task('ts', function () {
  return tsProject.src()
    .pipe(tsProject())
    .on('error', handleError)
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('copy-manifest-json', function () {
    return gulp.src(['src/manifest.json']).pipe(gulp.dest('dist'));
});

gulp.task('copy-libs', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js']).pipe(gulp.dest('dist/lib'));
});

gulp.task('webpack', ['ts'], function(callback) {
    // run webpack
    webpack({
        entry: {
          background: './.tmp/background/background.js',
          'content-scripts/github': './.tmp/content-scripts/github.js'
        },
        output: {
            filename: "[name].js",
            path: __dirname + "/dist"
        },
    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        callback();
    });
});

gulp.task('tslint', function() {
  var program = tslint.Linter.createProgram("src/tsconfig.json");

  return gulp.src(['src/**/*.ts'])
  .pipe(gulpTslint({
    formatter: 'verbose',
    configuration: 'tslint.json',
    program
  }))
  .on('error', handleError)
  .pipe(gulpTslint.report());
});

gulp.task('default', function(callback) {
  runSequence(
    'clean',
    ['copy-manifest-json', 'copy-libs'],
    ['webpack'],
    ['tslint'],
    callback);
});
