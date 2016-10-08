var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code
//  **********

gulp.task('build_free_video_player_full_with_modules', ['build_free_video_player_modules'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/temporary_build/free.video.player.modules.js',
            './free_videoplayer_components/free_video_player/free.video.player.js'])
        .pipe(concat('free.video.player.full.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'))
        .pipe(gulp.dest('./tests/freevideoplayer/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/'));
    cb(err);
});

gulp.task('build_free_video_player_full_with_modules_min', ['build_free_video_player_full_with_modules'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/temporary_build/free.video.player.modules.js',
            './free_videoplayer_components/free_video_player/free.video.player.js'])
        .pipe(concat('free.video.player.minified.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'));
    cb(err);
});

