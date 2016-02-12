var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc3'),
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
gulp.task('run_jsdoc_free_video_player_production' ,['clean_jsdoc_files_free_video_player_production'], function(cb){

    var productionConfig = {
        "opts": {
            "destination": "./production/freevideoplayer/documentation"
        }
    };

    gulp.src('./production/freevideoplayer/free.video.player.full.js', {read:false})
        .pipe(jsdoc(productionConfig, cb));

});

gulp.task('run_jsdoc_free_video_player_sample_page' ,['clean_jsdoc_files_free_video_player_sample_page'], function(cb){

    var publicConfig = {
        "opts": {
            "destination": "./public/documentation"
        }
    };

    gulp.src('./production/freevideoplayer/free.video.player.full.js', {read:false})
        .pipe(jsdoc(publicConfig, cb));
});