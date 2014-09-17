var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var stylish = require('jshint-stylish');
var ignore = require('gulp-ignore');
var zip = require('gulp-zip');
var clean = require('gulp-clean');

var scripts = ['public/js/home.js', 'server.js'];

gulp.task('lint', function() {
  return gulp.src(scripts)
    .pipe(ignore("*.min.js"))
    .pipe(ignore('node_modules/**'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('minify', function() {
  return gulp.src('public/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest("public/js/dist/"))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("public/js/dist/"));
});

gulp.task('zip', function() {
  return gulp.src('**')
    .pipe(zip('release.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['lint', 'minify']);
gulp.task('deploy', ['minify', 'zip']);

gulp.task('watch', function() {
  gulp.watch(scripts, ['test']);
});

gulp.task('default', ['test', 'watch']);

gulp.task('develop', function() {
  nodemon({
    script: 'server.js',
    ext: 'public',
    ignore: ['ignored.js']
  })
    .on('change', ['test'])
    .on('restart', function() {
      console.log('restarted!');
    })
})