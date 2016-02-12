var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  *************
//  Build license
//  *************

gulp.task('build_free_video_player_license', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/license/license-header.md',
            './free_videoplayer_components/license/license-base.md'])
        .pipe(concat('LICENSE.md'))
        .pipe(gulp.dest('./production/freevideoplayer/'));
    cb(err);
});