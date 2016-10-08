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


        //ADD test so we can run the player, maybe in a browser test here
        it('== Testing instantiating the free video player in Node environment, some methods might not be working correctly', function(done){
            //Do something here
            var configObject = {},
                fullPlayer = freeVideoPlayerFull(configObject);

            assert.isOk(fullPlayer, 'Error did not get ok from when trying to instantiating the Free Video Player');
            done();
        });

        it('== Trying to test method getName, should just return FREE VIDEO PLAYER', function(done){
            //Do something here

            var configObject = {},
                fullPlayer = freeVideoPlayerFull(configObject),
                name = fullPlayer.getName();

            assert.equal(name, 'FREE VIDEO PLAYER', 'Error did not get ok from test, name is not Free Video Player');
            done();
        });

        // it('== Trying to load a url, since the videoObject is not present it should', function(done){
        //     //Do something here
        //
        //     var videoUrl = '';
        //     var configObject = {},
        //         fullPlayer = freeVideoPlayerFull(configObject);
        //     var loaded = fullPlayer.load(videoUrl);
        //
        //     assert.isOk(loaded, 'Error did not get ok from test');
        //     done();
        // });
    });
});