'use strict';

var gulp = require('gulp'),
    es = require('event-stream'),
    del = require('del'),
    runSequence = require('run-sequence'),
    uglify = require('gulp-uglify');;

var props = {
    app: 'src/js',
    dist: 'src/js/min'
};

gulp.task('compress', function() {
  gulp.src(props.app + '/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(props.dist));
});

gulp.task('clean', function () {
    del(props.dist + '/*.js');
});

gulp.task('build', function () {
    runSequence('clean',
        'compress');
});
