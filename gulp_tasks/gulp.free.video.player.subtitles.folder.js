var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code
//  **********

gulp.task('build_free_video_player_subtitles_folder', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/subtitles/iso-639-1.json'])
        .pipe(concat('iso-639-1.json'))
        .pipe(gulp.dest('./production/freevideoplayer/subtitles/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/subtitles/'));
    cb(err);
});
