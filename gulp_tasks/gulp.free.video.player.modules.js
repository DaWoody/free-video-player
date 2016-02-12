var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

//  ***************************
//  Free Video Player - Modules
//  ***************************

//  **********
//  Build code
//  **********

gulp.task('build_free_video_player_modules', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/modules/free.video.player.namespace.js',
            './free_videoplayer_components/modules/free.video.player.splash.image.js',
            './free_videoplayer_components/modules/free.video.player.adaptive.stream.js',
            './free_videoplayer_components/modules/free.video.player.messages.js',
            './free_videoplayer_components/modules/free.video.player.controls.js',
            './free_videoplayer_components/modules/free.video.player.mpd.parser.js'])
        .pipe(concat('free.video.player.modules.js'))
        .pipe(gulp.dest('./free_videoplayer_components/temporary_build/'));
    cb(err);
});