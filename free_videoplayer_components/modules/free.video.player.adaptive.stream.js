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
        settingsObject = settingsObject;

    //Import dependencies and modules
    var mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, that.version),
        hlsParserModule = 'Add HLS PARSER HERE...';

    //Indicate that the returned object is a module
    that._isModule = true;

    //Create methods here
    //Some methods we will be using for the player here. We will write them like the way we do. Just the way it should be.
    //Awesomeness.


    //  ###############################
    //  #### SOURCE BUFFER METHODS ####
    //  ###############################
    /**
     * @description This method abort the source buffers, can be used when reloading/loading an asset.
     * @private
     */
    function _abortSourceBuffers(){
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
            messageObject.methodName = '_abortSourceBuffers';
            messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
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
    function _initiateMediaSource(){
        //Add the mediaSource to the class scoped storage
        that._mediaSource = new MediaSource();
        //Lets get our video wrapper and work with it from here
        that._videoWrapper = document.querySelector('.' + videoWrapperClassName);

        //Lets create the video element which we will be using to add buffers to
        //and other good stuff
        var videoElement = document.createElement('video');
        //Lets save our video element within the class so we can use it to add buffers
        //and more
        that._videoElement = videoElement;
        that._videoWrapper.appendChild(videoElement);
    };


    /**
     * @description This method adds eventlisteners to the media source object
     * @private
     */
    function _addEventListenersToMediaSource(){
        //  ### EVENT LISTENERS ###
        that._mediaSource.addEventListener('sourceopen', _videoready, false);
        that._mediaSource.addEventListener('webkitsourceopen', _videoready, false);

        that._mediaSource.addEventListener('webkitsourceended', function(e) {
            console.log('mediaSource readyState: ' + this.readyState);
        }, false);
    };


    /**
     * @description This method clears the current media source
     * @private
     */
    function _clearMediaSource(){
        try {
            that._mediaSource = null;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not clear mediaSource element, check accessibility in DOM';
                messageObject.methodName = '_clearMediaSource';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
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
    function _clearCurrentVideoObjectProperties(){
        //Add more stuff that needs clearing here
        that.currentVideoObject.subtitleTracksArray = [];
        //Lets clear all timestamps for the next stream
        that.currentVideoObject.adaptiveStreamBitrateObjectMap.clear();
        that.currentVideoObject.currentVideoBaseUrl = 'auto';
    };

    /**
     * @description This method clears the current video object properties that need to be cleared between plays
     * @private
     */
    function _clearCurrentVideoObjectProperties(){
        //Add more stuff that needs clearing here
        currentVideoObject.subtitleTracksArray = [];
        //Lets clear all timestamps for the next stream
        currentVideoObject.adaptiveStreamBitrateObjectMap.clear();
    };

    //Lets make the methods we need public
    //currentVideoObject methods
    that.addCurrentVideoObject = addCurrentVideoObject;
    that.removeCurrentVideoObject = removeCurrentVideoObject;

    //Media Source Extension methods
    that.browserSupportsMediaSource = browserSupportsMediaSource;

    //Lets return our object
    return that;
};
