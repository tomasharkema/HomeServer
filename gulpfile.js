var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var stylish = require('jshint-stylish');

gulp.task('lint', function() {
  return gulp.src("server.js")
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('minify', function() {
  return gulp.src('public/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest("public/js/dist/"))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("public/js/dist/"));
});

gulp.task('test', ['lint', 'minify']);