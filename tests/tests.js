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


        var configObject = {},
            fullPlayer = freeVideoPlayerFull(configObject);

        //ADD test so we can run the player, maybe in a browser test here
        it('== Testing instantiating the free video player in Node environment, some methods might not be working correctly', function(done){
            //Do something here

            assert.isOk(fullPlayer, 'Error did not get ok from when trying to instantiating the Free Video Player');
            done();
        });

        it('== Trying to test method getName, should just return FREE VIDEO PLAYER', function(done){
            //Do something here

            var name = fullPlayer.getName();

            assert.equal(name, 'FREE VIDEO PLAYER', 'Error did not get ok from test, name is not Free Video Player');
            done();
        });

        it('== Trying to test method getVersion, should return a string with version', function(done){
            //Do something here

            var string = fullPlayer.getVersion(),
                isString = typeof string === 'string' ? true : false;

            assert.isOk(isString, 'Error the version was not a string');
            done();
        });




        // it('== Testing method getVolume, should return a number', function(done){
        //     //Do something here
        //
        //     var volume = fullPlayer.getVolume(),
        //         isNumber = typeof volume == 'number' ? true : false;
        //     assert.isOk(isNumber, 'Error the volume returned from testing method .getVolume was not a number');
        //     done();
        // });
    });
});