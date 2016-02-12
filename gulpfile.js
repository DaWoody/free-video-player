/**
 * Main Gulp file
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc3'),
    del = require('del');

var requireDir = require('require-dir');
requireDir('./gulp_tasks');

//  ***************************
//  BASE GULP WORK FILE
//  ***************************
gulp.task('build', [
    'build_free_video_player_full_with_modules',
    'uglify_free_video_player',
    'build_free_video_player_subtitles_folder',
    'build_free_video_player_xml2json',
    'build_free_video_player_readme',
    'build_free_video_player_license',
    'build_free_video_player_stylesheet',
    'run_jsdoc_free_video_player_production',
    'run_jsdoc_free_video_player_sample_page'
]);

gulp.task('build_free_video_player_stylesheet', [
    'sass'
]);
