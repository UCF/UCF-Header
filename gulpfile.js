const fs = require('fs');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const sassLint = require('gulp-sass-lint');
const exec = require('child_process').exec;
const merge = require('merge');


let config = {
  src: {
    scssPath: './src/scss',
    jsPath: './compiler/assets'
  },
  dist: {
    cssPath: './bar/css',
    jsPath: './bar/js'
  },
  compilerPath: './compiler/',
  packagesPath: './node_modules',
  sync: false,
  syncTarget: 'http://localhost/'
};

/* eslint-disable no-sync */
if (fs.existsSync('./gulp-config.json')) {
  const overrides = JSON.parse(fs.readFileSync('./gulp-config.json'));
  config = merge(config, overrides);
}
/* eslint-enable no-sync */


//
// Helper functions
//

// Base SCSS linting function
function lintSCSS(src) {
  return gulp.src(src)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
}

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
    .pipe(gulp.dest(dest));
}

// Base JS linting function (with eslint). Fixes problems in-place.
// function lintJS(src, dest) {
//   dest = dest || config.src.jsPath;

//   return gulp.src(src)
//     .pipe(eslint({
//       fix: true
//     }))
//     .pipe(eslint.format())
//     .pipe(isFixed(dest));
// }

// // Base JS compile function
// function buildJS(src, dest) {
//   dest = dest || config.dist.jsPath;

//   return gulp.src(src)
//     .pipe(include({
//       includePaths: [config.packagesPath, config.src.jsPath]
//     }))
//     .on('error', console.log) // eslint-disable-line no-console
//     .pipe(babel())
//     .pipe(uglify())
//     .pipe(rename({
//       extname: '.min.js'
//     }))
//     .pipe(gulp.dest(dest));
// }

// BrowserSync reload function
function serverReload(done) {
  if (config.sync) {
    browserSync.reload();
  }
  done();
}

// BrowserSync serve function
function serverServe(done) {
  if (config.sync) {
    browserSync.init({
      proxy: {
        target: config.syncTarget
      }
    });
  }
  done();
}


//
// CSS
//

// Lint all scss files
gulp.task('scss-lint', () => {
  return lintSCSS(`${config.src.scssPath}/*.scss`);
});

// Compile main bar stylesheet
gulp.task('scss-build-bar', function () {
  return buildCSS(`${config.src.scssPath}/bar.scss`);
});

// Compile main bar stylesheet
gulp.task('scss-build-bootstrap2', function () {
  return buildCSS(`${config.src.scssPath}/bar-bootstrap.scss`);
});

// Compile 1200px breakpoint stylesheet
gulp.task('scss-build-1200bp', function () {
  return buildCSS(`${config.src.scssPath}/1200-breakpoint.scss`);
});

// All theme css-related tasks
gulp.task('css', gulp.series('scss-lint', 'scss-build-bar', 'scss-build-bootstrap2', 'scss-build-1200bp'));


//
// JavaScript
//

// // Run eslint on js files in src.jsPath
// gulp.task('es-lint', () => {
//   return lintJS([`${config.src.jsPath}/*.js`], config.src.jsPath);
// });

// // Concat and uglify js files through babel
// gulp.task('js-build', () => {
//   return buildJS(`${config.src.jsPath}/script.js`, config.dist.jsPath);
// });

// // All js-related tasks
// gulp.task('js', gulp.series('es-lint', 'js-build'));

// Build js via compile.sh
gulp.task('js-build', (done) => {
  exec('./compile.sh', { cwd: config.compilerPath }, (code, stdout, stderr) => {
    console.log('Exit code:', code);
    console.log('Program output:', stdout);
    console.log('Program stderr:', stderr);
    done(code);
  });
});

gulp.task('js', gulp.series('js-build'))


//
// Rerun tasks when files change
//
gulp.task('watch', (done) => {
  serverServe(done);

  gulp.watch(`${config.src.scssPath}/**/*.scss`, gulp.series('css', serverReload));
  gulp.watch(`${config.src.jsPath}/**/*.js`, gulp.series('js', serverReload));
  gulp.watch('./index.html', gulp.series(serverReload));
});


//
// Default task
//
gulp.task('default', gulp.series('css', 'js'));
