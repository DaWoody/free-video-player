var assert = require('chai').assert,
    supertest = require('supertest'),
    should = require('should');

    //Database = require('./../modules/database'),
    //mysql = require('mysql'),
    //config = require('./../config/config');

//Lets test all modules/modules here aswell
var express = require('express'),
    app = express();

var freeVideoPlayerFull = require('./../tests/freevideoplayer/free.video.player.full.tests.js');
    //xml2json = require('./../tests/freevideoplayer/xml2.json.min.js');
    //freeVideoPlayerMin = require('./../production/freevideoplayer/free.video.player.minified');

describe('*** Free Video Player - [TESTING] ***', function(){
    describe('# Test Free Video Player Full -', function(){

        // var configObject = {},
        //     fullPlayer = freeVideoPlayerFull(configObject);



        //ADD test so we can run the player, maybe in a browser test here
        it('== Testing the full videoPlayer', function(done){
            //Do something here
            assert.isOk(true, 'Error did not get ok from test');
            done();
        });

        // it('== Testing the test method.. should just return true..', function(done){
        //     //Do something here
        //     assert.isOk(movies.test(), 'Error did not get ok from test');
        //     done();
        // });
    });
});