/**
 * Main Gulp file
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    del = require('del');

var requireDir = require('require-dir');
requireDir('./gulp_tasks');

//  ***************************
//  BASE GULP WORK FILE
//  ***************************
gulp.task('build', [
    'build_free_video_player_full_with_modules',
    'build_free_video_player_full_with_modules_min',
    'build_free_video_player_full_with_modules_for_tests',
    'add_description_to_minified_free_video_player',
    'add_description_to_full_free_videoplayer',
    'build_free_video_player_subtitles_folder',
    'build_free_video_player_xml2json',
    'build_free_video_player_readme',
    'build_free_video_player_license',
    'build_free_video_player_stylesheet',
    'run_jsdoc_free_video_player_sample_page',
    'run_jsdoc_free_video_player_production'
]);

gulp.task('build_free_video_player_stylesheet', [
    'sass'
]);
