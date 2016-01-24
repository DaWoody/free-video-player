var gulp = require('gulp'),
    concat = require('gulp-concat'),
    mocha = require('gulp-mocha'),
    jsdoc = require('gulp-jsdoc'),
    del = require('del');

//  ****************************
//  Free Video Player - Xml2Json
//  ****************************

//  ******************************
//  Build And Concatenate Xml2Json
//  ******************************

gulp.task('build_free_video_player_xml2json', function(cb) {
    // place code for your default task here
    return gulp.src([
            './free_videoplayer_components/dependencies/xml2.json.min.js'])
        .pipe(concat('xml2.json.min.js'))
        .pipe(gulp.dest('./production/freevideoplayer/'))
        .pipe(gulp.dest('./public/js/freevideoplayer/'));
    cb(err);
});
