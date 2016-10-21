var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del');

//  ***************************
//  Free Video Player
//  ***************************

//  *************
//  Build license
//  *************

gulp.task('build_free_video_player_npm_package_json', function(cb) {
    // place code for your default task here
    return gulp.src([
        './free_videoplayer_components/npm_registry_package_json/package.json'])
        .pipe(concat('package.json'))
        .pipe(gulp.dest('./production/freevideoplayer/'));
    cb(err);
});