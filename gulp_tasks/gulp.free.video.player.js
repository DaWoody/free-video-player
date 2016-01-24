var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code //Currently not used
//  **********

gulp.task('build_free_video_player', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/free.video.player.js'])
        .pipe(concat('free.video.player.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/'));
    cb(err);
});
