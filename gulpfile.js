var autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    cleanCSS = require('gulp-clean-css'),
    gulp = require('gulp'),
    merge = require('merge')
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    scsslint = require('gulp-scss-lint'),
    shelljs = require('shelljs');


var configLocal = require('./gulp-config.json'),
    configDefault = {
      src: {
        scssPath: './src/scss',
        jsPath:   './compiler/assets/js'
      },
      dist: {
        cssPath:  './bar/css',
        jsPath:   './bar/js'
      },
      compilerPath: './compiler/',
      packagesPath: './node_modules',
      sync: false,
      syncTarget: 'http://localhost/'
    },
    config = merge(configDefault, configLocal);


//
// CSS
//

// Base linting function
function lintSCSS(src) {
  return gulp.src(src)
    .pipe(scsslint({
      'maxBuffer': 400 * 1024  // default: 300 * 1024
    }));
}

// Lint all scss files
gulp.task('scss-lint-all', function() {
  return lintSCSS(config.src.scssPath + '/*.scss');
});

// Base SCSS compile function
function buildCSS(src, dest) {
  dest = dest || config.dist.cssPath;

  return gulp.src(src)
    .pipe(sass({
      includePaths: [config.src.scssPath, config.packagesPath]
    })
      .on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(autoprefixer({
      // Supported browsers added in package.json ("browserslist")
      cascade: false
    }))
    .pipe(rename({
      extname: '.css'
    }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
}

// Compile main bar stylesheet
gulp.task('scss-build-bar', function() {
  return buildCSS(config.src.scssPath + '/bar.scss');
});

// Compile main bar stylesheet
gulp.task('scss-build-bootstrap2', function () {
  return buildCSS(config.src.scssPath + '/bar-bootstrap.scss');
});

// Compile 1200px breakpoint stylesheet
gulp.task('scss-build-1200bp', function () {
  return buildCSS(config.src.scssPath + '/1200-breakpoint.scss');
});

// All theme css-related tasks
gulp.task('css', ['scss-lint-all', 'scss-build-bar', 'scss-build-bootstrap2', 'scss-built-1200bp']);


//
// JavaScript
//

// Concat and uglify js files through babel
gulp.task('js-build', function() {
  shelljs.cd(config.compilerPath);
  return shelljs.exec('./compile.sh', function (code, stdout, stderr) {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
  });
});

// All js-related tasks
// gulp.task('js', function() {
//   runSequence('es-lint', 'js-build');
// });
gulp.task('js', ['js-build']);


//
// Rerun tasks when files change
//
gulp.task('watch', function() {
  if (config.sync) {
    browserSync.init({
        proxy: {
          target: config.syncTarget
        }
    });
  }

  gulp.watch(config.src.scssPath + '/**/*.scss', ['css']);
  gulp.watch(config.src.jsPath + '/**/*.js', ['js']).on('change', browserSync.reload);
  gulp.watch('./**/*.php').on('change', browserSync.reload);
});


//
// Default task
//
gulp.task('default', ['css', 'js']);
