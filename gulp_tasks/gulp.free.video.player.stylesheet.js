var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass');

//  ***************************
//  Free Video Player - SCSS
//  ***************************

//  *******************
//  Build Stylesheet
//  *******************

'use strict';

var input = './free_videoplayer_components/stylesheet/scss/*.scss',
    output1 = './public/css',
    output2 = './production/freevideoplayer/',
    output3 = './production/scss';


gulp.task('copy_sass', function(cb){
    return gulp
        .src(input)
        .pipe(gulp.dest(output3));
    cb(err);
});

gulp.task('sass', ['copy_sass'], function (cb) {
    return gulp
    // Find all `.scss` files from the `stylesheets/` folder
        .src(input)
        // Run Sass on those files
        .pipe(sass())
        // Write the resulting CSS in the output folder
        .pipe(gulp.dest(output1))
        .pipe(gulp.dest(output2));
    cb(err);
});

gulp.task('watch', function() {
    return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
        .watch(input, ['sass'])
        // When there is a change,
        // log a message in the console
        .on('change', function(event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});