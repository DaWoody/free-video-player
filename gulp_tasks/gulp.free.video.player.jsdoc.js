var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc'),
    del = require('del');

//  *******************
//  JSDOC
//  *******************

//Remove JSDoc production files before building
gulp.task('clean_jsdoc_files_free_video_player_production', ['build_free_video_player_full_with_modules'], function(cb){
    return del([
        './production/documentation/**/*'
    ]);
    cb(err);
});

gulp.task('clean_jsdoc_files_free_video_player_sample_page', ['build_free_video_player_full_with_modules'], function(cb){
    return del([
        './public/documentation/**/*'
    ]);
    cb(err);
});

//Build JSDOC
gulp.task('run_jsdoc_free_video_player_production' ,['clean_jsdoc_files_free_video_player_production', 'clean_jsdoc_files_free_video_player_sample_page'], function(cb){
    return gulp.src('./production/freevideoplayer/free.video.player.full.js')
        .pipe(jsdoc('./production/documentation/freevideoplayer/'));
    cb(err);
});

gulp.task('run_jsdoc_free_video_player_sample_page' ,['run_jsdoc_free_video_player_production'], function(cb){
    return gulp.src('./production/freevideoplayer/free.video.player.full.js')
        .pipe(jsdoc('./public/documentation/freevideoplayer/'));
    cb(err);
});