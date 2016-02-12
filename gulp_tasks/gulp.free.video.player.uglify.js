var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code
//  **********

gulp.task('uglify_free_video_player', ['build_free_video_player_full_with_modules'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './production/freevideoplayer/free.video.player.full.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./production/freevideoplayer/free.video.player.min.js'));
    cb(err);
});
