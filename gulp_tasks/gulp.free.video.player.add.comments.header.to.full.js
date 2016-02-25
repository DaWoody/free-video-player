var gulp = require('gulp'),
    concat = require('gulp-concat');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code
//  **********

gulp.task('add_description_to_full_free_videoplayer', ['uglify_free_video_player'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/minified_version_inline_commentary/header.js',
            './production/freevideoplayer/free.video.player.full.js'])
        .pipe(concat('free.video.player.full.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/'));
    cb(err);
});
