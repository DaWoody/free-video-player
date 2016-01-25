var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass');

//  ***************************
//  Free Video Player - SCSS
//  ***************************

//  *******************
//  Build Stylesheet
//  *******************

'use strict';

gulp.task('remove_fonts_public', function(cb){
    return del([
        './public/css/fonts/**/*'
    ]);
    cb(err);
});

gulp.task('remove_fonts_production', function(cb){
    return del([
        './production/freevideoplayer/css/fonts/**/*'
    ]);
    cb(err);
});

gulp.task('copy_fonts', ['remove_fonts_production', 'remove_fonts_public'], function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/stylesheet/fonts/*'])
        .pipe(gulp.dest('./production/freevideoplayer/css/fonts/'))
        .pipe(gulp.dest('./public/css/fonts/'));
    cb(err);
});

var input = './free_videoplayer_components/stylesheet/scss/*.scss',
    output1 = './public/css',
    output2 = './production/freevideoplayer/css';

gulp.task('sass', ['copy_fonts'], function () {
    return gulp
    // Find all `.scss` files from the `stylesheets/` folder
        .src(input)
        // Run Sass on those files
        .pipe(sass())
        // Write the resulting CSS in the output folder
        .pipe(gulp.dest(output1))
        .pipe(gulp.dest(output2));
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