var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  ************
//  Build readme
//  ************

gulp.task('build_free_video_player_readme', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/readme/readme-header.md',
            './free_videoplayer_components/readme/readme-version.md',
            './free_videoplayer_components/readme/readme-base.md'])
        .pipe(concat('README.md'))
        .pipe(gulp.dest('./production/freevideoplayer/readme/'))
        .pipe(gulp.dest('./'));
    cb(err);
});