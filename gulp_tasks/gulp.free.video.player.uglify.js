var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

//  ***************************
//  Free Video Player
//  ***************************

//  **********
//  Build code
//  **********
gulp.task('uglify_free_video_player', ['build_free_video_player_full_with_modules', 'build_free_video_player_full_with_modules_min'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './production/freevideoplayer/free.video.player.minified.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./production/freevideoplayer/'));
    cb(err);
});


gulp.task('add_description_to_minified_free_video_player', ['uglify_free_video_player'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/minified_version_inline_commentary/header.js',
            './production/freevideoplayer/free.video.player.minified.js'])
        .pipe(concat('free.video.player.minified.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/'));
    cb(err);
});
