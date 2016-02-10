/**
 * @title FREE VIDEO PLAYER - ADAPTIVE STREAM MODULE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @description A video controls module to use with the FREE VIDEO PLAYER library.
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 */
//Add the video controls to the namespace
freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStream = function(settingsObject){
    //Add stuff here and refactor so we gather adaptive streaming stuff in one module

    //SEEMS TO BE NEEDING MediaSource, VideoElement, VideoWrapper, CurrentVideoObject
    // and such, lets see how we solve the issues..

    'use strict';

    var that = {},
        settingsObject = settingsObject,
        moduleName = 'ADAPTIVE STREAMING',
        currentVideoObject = {},
        currentVideoStreamObject = {};

    //Import dependencies and modules
    var mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, that.version),
        hlsParserModule = 'Add HLS PARSER HERE...';

    //Indicate that the returned object is a module
    that._isModule = true;

    //Create methods here
    //Some methods we will be using for the player here. We will write them like the way we do. Just the way it should be.
    //Awesomeness.

    //  ############################
    //  #### INITIATION METHODS ####
    //  ############################

    function printOutOnStartup(){
        if(browserSupportsMediaSource()){
            var messageObject = {};
            messageObject.message = 'Adaptive Bitrate Module - started with support for MSE';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject);
        } else {
            var messageObject = {};
            messageObject.message = 'ERROR - Adaptive Bitrate Module - Browser do not support MSE';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject);
        }
    };

    //Initiation method
    function initiate(){
        printOutOnStartup();
    };



    //  ###############################
    //  #### SOURCE BUFFER METHODS ####
    //  ###############################
    /**
     * @description This method abort the source buffers, can be used when reloading/loading an asset.
     * @private
     */
    function abortSourceBuffers(currentVideoStreamObject){
        try {
            console.log('Reached abort source buffers');
            var sourceBuffers = currentVideoStreamObject.sourceBuffers;
            for(var i = 0, sourceBuffersLength = sourceBuffers.length; i < sourceBuffersLength; i++){
                //Source buffer
                console.log('Trying to abort source buffer stream index ' + i);
                sourceBuffers[i].abort();
            }
            currentVideoStreamObject.sourceBuffers = [];
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not abort source buffers, check accessibility';
                messageObject.methodName = 'abortSourceBuffers';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }

        //Should we just return that module or the videoStreamingObject
    };

    //  ########################################
    //  #### MEDIA SOURCE EXTENSION METHODS ####
    //  ########################################
    function browserSupportsMediaSource(){
      var browserSupportsMediaSourceExtension = false,
          mediaSource = new MediaSource() || null;

        if(mediaSource){
            browserSupportsMediaSourceExtension = true;
        }
        return browserSupportsMediaSourceExtension;
    };

    /**
     * @description This method initiates the media source extension and creates a video element aswell.
     * @private
     */
    function initiateMediaSource(that){
        //Add the mediaSource to the class scoped storage
        that._mediaSource = new MediaSource();
        return that;
    };

    /**
     * @description Creates a video element
     * @param that
     * @param videoWrapperClassName
     * @returns {*}
     */
    function createVideoElementAndAppendToWrapper(that, videoWrapperClassName){
        //Lets get our video wrapper and work with it from here
        that._videoWrapper = document.querySelector('.' + videoWrapperClassName);

        //Lets create the video element which we will be using to add buffers to
        //and other good stuff
        var videoElement = document.createElement('video');
        //Lets save our video element within the class so we can use it to add buffers
        //and more
        that._videoElement = videoElement;
        that._videoWrapper.appendChild(videoElement);
        return that;
    };


    //  ########################
    //  #### BUFFER METHODS ####
    //  ########################
    /**
     * @description This method checks the buffers
     * @private
     */
    function _checkBuffers() {
        console.log('video player buffer: ' + that._videoElement.buffered);
        console.log('video player state: ' + that._videoElement.readyState);

        if( that._videoElement.HAVE_NOTHING == that._videoElement.readyState){
            //return;
        }

        if( 0 == that._videoElement.buffered.length ) {
            that._videoElement.readyState = that._videoElement.HAVE_METADATA;
            //return;
        } else if( that._videoElement.currentTime > that._videoElement.buffered.end(0) - 15 ) {
            that._videoElement.readyState = that._videoElement.HAVE_FUTURE_DATA;
        }

        switch(that._videoElement.readyState) {
            case that._videoElement.HAVE_NOTHING:
            case that._videoElement.HAVE_METADATA:
            case that._videoElement.HAVE_CURRENT_DATA:
            case that._videoElement.HAVE_FUTURE_DATA:
                // Should load more data
                //appendData(vSourceBuffer, VFILE, 'video/mp4');
                //appendData(aSourceBuffer, AFILE, 'audio/mp4');
                break;
            case that._videoElement.HAVE_ENOUGH_DATA:
                break;
        };
    };



    /**
     * @description This method adds eventlisteners to the media source object
     * @private
     */
    function addEventListenersToMediaSource(that){
        //  ### EVENT LISTENERS ###
        that._mediaSource.addEventListener('sourceopen', _videoready, false);
        that._mediaSource.addEventListener('webkitsourceopen', _videoready, false);

        that._mediaSource.addEventListener('webkitsourceended', function(e) {
            console.log('mediaSource readyState: ' + this.readyState);
        }, false);
        return that;
    };


    /**
     * @description This method clears the current media source
     * @private
     */
    function clearMediaSource(that){
        try {
            that._mediaSource = null;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not clear mediaSource element, check accessibility in DOM';
                messageObject.methodName = 'clearMediaSource';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return that;
    };

    //  ######################################
    //  #### CURRENT VIDEO OBJECT METHODS ####
    //  ######################################
    /**
     * @description Adds the current video object as a part of the class scoped variable
     * @param currentVideoObject
     * @public
     */
    function addCurrentVideoObject(currentVideoObject){
        that.currentVideoObject = currentVideoObject;
    };

    /**
     * @description Removes the current video object from the class scoped variable
     * @public
     */
    function removeCurrentVideoObject(){
        that.currentVideoObject = null;
    };

    /**
     * @description This method clears the current video object properties that need to be cleared between plays
     * @private
     */
    function clearCurrentVideoObjectProperties(that){
        //Add more stuff that needs clearing here
        that.currentVideoObject.subtitleTracksArray = [];
        //Lets clear all timestamps for the next stream
        that.currentVideoObject.adaptiveStreamBitrateObjectMap.clear();
        that.currentVideoObject.currentVideoBaseUrl = 'auto';
        return that;
    };


    //  #########################
    //  #### BITRATE METHODS ####
    //  #########################
    /**
     * @description A method that first verifies that the videoControlsModule is in use, then tries to contact
     * the module by accessing a public method that generates
     * @param bitrateSettingsObject
     * @private
     */
    var _updateVideoControlsWithBitrateSettings = function(bitrateSettingsObject){
        var typeOfStream = bitrateSettingsObject.typeOfStream,
            baseUrlObjectArray = bitrateSettingsObject.baseUrlObjectArray;

        console.log('Ok reached this thing here.. baseUrlObejctsArray..:');
        console.log(bitrateSettingsObject);

        //If the videoControlsModule is defined
        if(videoControlsModule){
            videoControlsModule.addBitrateMenuToSettingsIcon(typeOfStream, baseUrlObjectArray);
        }
    };



    //Lets make the methods we need public
    //currentVideoObject methods
    that.addCurrentVideoObject = addCurrentVideoObject;
    that.removeCurrentVideoObject = removeCurrentVideoObject;
    that.clearCurrentVideoObjectProperties = clearCurrentVideoObjectProperties;

    //Media Source Extension methods
    that.browserSupportsMediaSource = browserSupportsMediaSource;

    that.initiateMediaSource = initiateMediaSource;
    that.abortSourceBuffers = abortSourceBuffers;
    that.clearMediaSource = clearMediaSource;
    that.addEventListenersToMediaSource = addEventListenersToMediaSource;
    that.createVideoElementAndAppendToWrapper = createVideoElementAndAppendToWrapper;

    //Lets run this method on startup
    initiate();
    //Lets return our object
    return that;
};
