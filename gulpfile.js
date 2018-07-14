const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const p = require('gulp-load-plugins')();
const runSequence = require('run-sequence');
const reload = browserSync.reload;
const webpackStream = require('webpack-stream');
const webpack = require('webpack');

const webpackConfig = require('./webpack.config');


const input = 'src';
const output = 'public_html';
const sassSrc = [`${input}/**/*.scss`, `!${input}/**/_*.scss`];

const plumberNotify = () => {
  return p.plumber({errorHandler: p.notify.onError("<%= error.message %>")});
};

// clean
gulp.task('clean', (callback) => {
  rimraf(output, callback);
});

// copy
gulp.task('static', () => {
  return gulp.src(`${input}/**/*.{pot,html,gif,jpg,png,ico,svg,eot,ttf,woff}`)
    .pipe(gulp.dest(output));
});

// sass
gulp.task('sass', () => {
  return gulp.src(sassSrc, {
    base: input
  })
  .pipe(p.using())
  .pipe(plumberNotify())
  .pipe(p.sourcemaps.init())
  .pipe(p.sass({outputStyle: 'expanded'}).on('error', p.sass.logError))
  .pipe(p.autoprefixer({
    browsers: ['last 2 versions', 'ie 10-11', 'iOS >= 10', 'Android >= 5.0'],
    cascade: false
  }))
  .pipe(p.sourcemaps.write('./'))
  .pipe(gulp.dest(output));
});

// Webpack
gulp.task('webpack', () => {
  return webpackStream(webpackConfig, webpack)
    .on('error', function handleError() {
      this.emit('end');
    })
    .pipe(gulp.dest(webpackConfig.output.path));
});

// server
gulp.task('server', () => {
  browserSync.init({
    server: {
      baseDir: output,
      index: 'index.html'
    }
  });
});

// watch
gulp.task('watch', ['server'], () => {
  gulp.watch(`${input}/**/*.{pot,html,gif,jpg,png,ico,svg,eot,ttf,woff}`, ['static', reload]);
  gulp.watch(`${input}/**/*.scss`, ['sass', reload]);
  gulp.watch(`${input}/**/*.js`, ['webpack', reload]);
});

// default
gulp.task('default', (callback) => {
  return runSequence('clean', ['static','sass'], 'webpack', 'watch', callback);
});
