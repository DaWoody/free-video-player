/**
 * @name FREE VIDEO PLAYER
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A cool open source html5 video library to use when want to play both regular HTML5 content such as mp4, webm but also for adaptive streaming formats such as DASH for instance, Requires the xml2json library to work. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @version 0.9.0
 * @param {object} initiationObject - The initiation object containing information about how to configure the Free Video Player
 */
var freeVideoPlayer = function(initiationObject){

    'use strict';

    //  ################################
    //  #### VARIABLE INSTANTIATION ####
    //  ################################
    var that = {},
        moduleName = 'Free Video Player',
        isModuleValue = false,
        moduleVersion = '0.9.0',
        videoPlayerNameCss = 'free-video-player',
        base64encodedImage = freeVideoPlayerModulesNamespace.freeVideoPlayerDefaultSplashImage,
        xml2json = new X2JS(),
        defaultSettingsObject = {
            videoWrapperClassName: 'js-' + videoPlayerNameCss,
            videoWrapperBackgroundColor:  '#292c3c',
            videoSplashImageUrl: base64encodedImage,
            iso6391Url:'js/freevideoplayer/subtitles/iso-639-1.json',
            videoControlsInnerHtml : {
                playIconInnerHtml:'<i class="fa fa-play"></i>',
                pauseIconInnerHtml:'<i class="fa fa-pause"></i>',
                stopIconInnerHtml:'<i class="fa fa-stop"></i>',
                volumeHighIconInnerHtml:'<i class="fa fa-volume-up"></i>',
                volumeLowIconInnerHtml:'<i class="fa fa-volume-down"></i>',
                novolumeIconInnerHtml:'<i class="fa fa-volume-off"></i>',
                fullscreenExpandIconInnerHtml:'<i class="fa fa-expand"></i>',
                fullscreenCompressIconInnerHtml:'<i class="fa fa-compress"></i>',
                spinnerIconInnerHtml: '<i class="fa fa-circle-o-notch fa-spin"></i>',
                settingsIconInnerHtml:'<i class="fa fa-cog"></i>',
                liveIconInnerHtml:'<i class="fa fa-circle"></i> LIVE',
                videoFormatContainerInnerHtml:'format: ',
                subtitlesMenuInnerHtml:'subtitles: ',
                bitrateQualityMenuInnerHtml:'quality: ',
                subtitlesMenuOffButtonInnerHtml:'off'
            },
            videoControlsCssClasses: {
                videoControlsClass: videoPlayerNameCss + '-controls',
                hideControlClass: videoPlayerNameCss + '-controls-hide',
                displayControlClass: videoPlayerNameCss + '-controls-display',
                videoFullScreenClass: videoPlayerNameCss + '-controls-fullscreen',
                playpauseContainerClass: videoPlayerNameCss + '-controls-playpause',
                progressbarContainerClass: videoPlayerNameCss + '-controls-progress',
                progressBarBufferedClass: videoPlayerNameCss + '-controls-progress-buffered',
                progressTimerContainerClass: videoPlayerNameCss + '-controls-progress-timer',
                volumeContainerClass: videoPlayerNameCss + '-controls-volume',
                volumeIconClass: videoPlayerNameCss + '-controls-volume-icon',
                fullscreenContainerClass: videoPlayerNameCss + '-controls-fullscreen',
                hideVideoOverlayClass: videoPlayerNameCss + '-controls-overlay-hide',
                showVideoOverlayClass: videoPlayerNameCss + '-controls-overlay-show',
                settingsIconClass: videoPlayerNameCss + '-controls-settings-icon',
                subtitlesMenuContainerClass: videoPlayerNameCss + '-controls-subtitles-container',
                settingsMenuClass: videoPlayerNameCss + '-controls-settings-menu',
                subtitlesMenuClass: videoPlayerNameCss + '-controls-subtitles-menu',
                subtitleButtonClass: videoPlayerNameCss + '-controls-subtitles-button',
                bitrateQualityMenuContainerClass: videoPlayerNameCss + '-controls-bitrate-quality-menu-container',
                bitrateQualityMenuClass: videoPlayerNameCss + '-controls-bitrate-quality-menu',
                liveIconClass: videoPlayerNameCss + '-controls-live-icon',
                videoFormatContainerClass: videoPlayerNameCss + '-controls-video-format',
                videoOverlayPlayPauseIconClass: videoPlayerNameCss + '-controls-overlay-play-pause-icon',
                videoOverlaySpinnerIconClass: videoPlayerNameCss + '-controls-overlay-spinner-icon',
                displayNoneClass: videoPlayerNameCss + '-controls-display-none'
            },
            videoControlsDisplay: {
                showPlayPauseButton: true,
                showProgressSlider: true,
                showVolumeIcon: true,
                showVolumeSlider: true,
                showSubtitlesMenu: true,
                showSettingsIcon: true,
                showTimer: true,
                showFullScreenButton: true
            },
            videoControlsVolumeTresholdValues: {
                volumeHighStart:40,
                volumeLowEnd:10
            },
            debugMode:true,
            createControls:true
        },
        settingsObject = Object.assign({}, defaultSettingsObject, initiationObject),
        videoWrapperClassName = settingsObject.videoWrapperClassName;

    var videoPlayerObject = {
        subtitleLanguageObject: []
    };

    var currentVideoObject = {
        mpdObject:{},
        adaptiveStream:false,
        adaptionSets: [],
        subtitleTracksArray: [],
        subtitleMenuItems: [],
        playing:false,
        fullScreen:false,
        muted:false,
        volumeBeforeMute:1,
        adaptiveStreamBitrateObjectMap: new Map(),
        //used for the adaptive bitrate algo, should probably be refactored later
        currentVideoBaseUrl:'auto'
    };

    //Add references to helper libraries
    var messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, moduleVersion),
        mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        videoControlsModule = freeVideoPlayerModulesNamespace.freeVideoPlayerControls(settingsObject, videoPlayerNameCss),
        adaptiveStreamingModule = freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStream(settingsObject, videoControlsModule),
        hlsParserModule = 'Add HLS PARSER HERE...';

    //  ######################
    //  #### LOAD METHODS ####
    //  ######################
    /**
     * @function
     * @description This is the main load method, this method parses the video url and based on that decides which
     * format the video is. If its an adaptive bitrate stream or a regular stream like mp4 for instance.
     * @name load
     * @param {string} videoUrl - The video url, ending with things like .mp4, .webm or .mpd
     * @param {object} optionalConfigurationObject - An optional configuration object containing information such as videoSplashImage and more
     * @public
     */
    var load = function(videoUrl, optionalConfigurationObject){
        //This method will understand
        var streamType = _returnStreamTypeBasedOnVideoUrl(videoUrl);
        //Lets clear the video container first
        _clearVideo();

        //Lets set background of videoPlayer instance
        //and make it sweet ;)
        that._videoWrapper = document.querySelector('.' + videoWrapperClassName);
        that._videoWrapper.setAttribute('style', 'background:' + settingsObject.videoWrapperBackgroundColor + ';');

        //var className = that._videoWrapper.getAttribute('class');
        //that._videoWrapper.setAttribute('class', className + ' free-video-player-paused');
        switch (streamType){
            case 'mp4' : //Start video as an mp4
                _loadNonAdaptiveVideo(videoUrl, 'mp4', optionalConfigurationObject);
                break;

            case 'ogg' : //Start video as an mp4
                _loadNonAdaptiveVideo(videoUrl, 'ogg', optionalConfigurationObject);
                break;

            case 'webm' :
                _loadNonAdaptiveVideo(videoUrl, 'webm', optionalConfigurationObject);
                break;

            case 'dash' : //Start video as dash
                _loadMpd(videoUrl, optionalConfigurationObject);
                break;

            case 'hls' : //Start video as hls
                //loadHls(videoUrl);
                break;

            default :
                //Start video as mp4?
                //Lets print out an error message if the url is not correct
                //currently
                var messageObject = {};
                    messageObject.message = 'The provided media url does not seem to be valid, check input';
                    messageObject.methodName = 'load';
                    messageObject.moduleName = moduleName;
                    messageObject.moduleVersion = moduleVersion;
                messagesModule.printOutErrorMessageToConsole(messageObject);
        }
    };

    /**
     * @function
     * @description This is the main load method, this method parses the video url and based on that decides which
     * format the video is. If its an adaptive bitrate stream or a regular stream like mp4 for instance.
     * @name _loadNonAdaptiveVideo
     * @param {string} videoUrl - The video url, ending with things like .mp4, .webm or .mpd
     * @param {string} typeOfVideo - The type of video, a string with values such as mp4, webm etc.
     * @param {object} optionalConfigurationObject - An optional configuration object
     * @private
     */
    var _loadNonAdaptiveVideo = function(videoUrl, typeOfVideo, optionalConfigurationObject){
        //Load the video as a non adaptive video here
        try {
            //Set a flag to decide what kind of stream is played.
            currentVideoObject.adaptiveStream = false;
            //Lets set this flag to know that we are dealing with static/VOD content.
            currentVideoObject.mediaType = 'static';

            var videoElement = document.createElement('video'),
                videoSourceElement = document.createElement('source');

            //Do the magice here
            if(typeOfVideo === 'mp4') {
                videoSourceElement.setAttribute('type', 'video/mp4');
            }

            if(typeOfVideo === 'ogg') {
                videoSourceElement.setAttribute('type', 'video/ogg');
            }

            if(typeOfVideo === 'webm') {
                videoSourceElement.setAttribute('type', 'video/webm');
            }

            videoSourceElement.setAttribute('src', videoUrl);
            videoElement.appendChild(videoSourceElement);

            //Lets add the video element
            that._videoElement = videoElement;
            if(optionalConfigurationObject){
                that._videoElement.poster = optionalConfigurationObject.videoSplashImageUrl ? optionalConfigurationObject.videoSplashImageUrl : settingsObject.videoSplashImageUrl;
            } else {
                that._videoElement.poster = settingsObject.videoSplashImageUrl;
            }

            that._videoElement.addEventListener('durationchange', function(){
                currentVideoObject.mediaDurationInSeconds = that._videoElement.duration;
                videoControlsModule.updateProgressBarWithBufferedData(
                    0,
                    that._videoElement.duration,
                    that._videoElement.duration);
            });

            //Ok fetching the video wrapper which we previously defined in the load method.
            that._videoWrapper.appendChild(videoElement);

            //Lets set the videoFormat on our current asset on the currentVideoObject so this can be
            //be used within the video player controls for instance
            currentVideoObject.videoFormat = typeOfVideo;

            if(settingsObject.createControls){
                //If we want to create the video controls our selves
                videoControlsModule.createVideoControls(that._videoWrapper, currentVideoObject);
            }
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not create and load non-adaptive-video stream, check input type and videoUrl';
                messageObject.methodName = 'loadNonAdaptiveVideo';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * This method loads the mpd and then utilizes a set of methods to parse through the MPD, adding data to
     * a scoped variable called currentVideoObject and then also firing away and starts the video
     * @private
     * @param {string} mpdUrl
     */
    var _loadMpd = function(mpdUrl, optionalConfigurationObject){

        var responseObject = {};

        mpdParserModule.getMpd(mpdUrl, function(response){
            try {
                currentVideoObject.adaptiveStream = true;
                responseObject = xml2json.xml_str2json(response);

                messagesModule.printOutLine('MPD OBJECT:');
                messagesModule.printOutLine(responseObject.MPD);

                var mpdObject = responseObject.MPD;


                //mpdObject = mpdParserModule.returnMpdObjectWithAddedBaseUrl(mpdObject, mediaBaseUrl);
                mpdParserModule.setMpdObject(responseObject.MPD);

                currentVideoObject.mediaType = mpdParserModule.returnMediaTypeFromMpdObject(mpdObject);
                currentVideoObject.averageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject(mpdObject);
                currentVideoObject.maxSegmentDuration = mpdParserModule.returnMaxSegmentDurationFromMpdObject(mpdObject);
                currentVideoObject.mediaDurationInSeconds = mpdParserModule.returnMediaDurationInSecondsFromMpdObject(mpdObject);

                //Lets set the videoFormat on our current asset on the currentVideoObject so this can be
                //be used within the video player controls for instance
                currentVideoObject.videoFormat = 'dash';

                //Lets set our streamBaseUrl based on the mpdUrl
                var streamBaseUrl = mpdParserModule.returnStreamBaseUrlFromMpdUrl(mpdUrl);

                //Lets add methods so we can parse the mpd already here and decide if
                //there are subtitles to be added or not
                var subtitleTracksArray = mpdParserModule.returnArrayOfSubtitlesFromMpdObjectAndBaseUrl(mpdObject, streamBaseUrl);
                currentVideoObject.subtitleTracksArray = videoControlsModule.returnModifiedArrayOfSubtitlesWithLabel(subtitleTracksArray, videoPlayerObject.subtitleLanguageObject);

                messagesModule.printOutLine('INCLUDES SUBS:');
                messagesModule.printOutLine(currentVideoObject.subtitleTracksArray);

                //Lets create objects we need to perform the streaming
                //Lets initiate the media source now if the stream is
                //and adaptive bitstream
                //Add a new Media Source object and methods to that.
                var adaptiveVideoObject = {
                    streamBaseUrl: streamBaseUrl,
                    currentVideoObject: currentVideoObject,
                    videoWrapperClassName: videoWrapperClassName,
                    mpdObject: mpdObject,
                    optionalConfigurationObject: optionalConfigurationObject
                };

                //Lets load our video stream as DASH
                adaptiveStreamingModule.loadDashMediaWithMediaSourceExtension(adaptiveVideoObject);

                // Lets overwrite our videoElement by fetching it from the adaptiveStreamingModule
                // and setting it to the current video element
                that._videoElement = adaptiveStreamingModule.getVideoElement();

                //Lets add subtitles to DOM
                videoControlsModule.addSubtitlesTracksToDom(currentVideoObject.subtitleTracksArray, that._videoWrapper);

                //Just for testing printint out the object
                messagesModule.printOutLine('CURRENT VIDEO OBJECT:');
                messagesModule.printOutLine(currentVideoObject);

                if(settingsObject.createControls){
                    //If we want to create the video controls our selves
                    videoControlsModule.createVideoControls(that._videoWrapper, currentVideoObject);
                }
            } catch (e){
                var messageObject = {};
                    messageObject.message = 'Could not parse input to object from xml, for the loadMpd request, check input to the xml2json library';
                    messageObject.methodName = 'loadMpd';
                    messageObject.moduleName = moduleName;
                    messageObject.moduleVersion = moduleVersion;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
            }
        });
    };

    /**
     * @function
     * @description A return method that could be public to return the current video's subtitle infor in
     * an array of subtitleObjects containing values such as label, language, id.
     * @name getArrayOfSubtitleObjects
     * @public
     * @returns {array} - The subtitle tracks array
     */
    var getArrayOfSubtitleObjects = function(){
        return currentVideoObject.subtitleTracksArray;
    };

    //  #########################
    //  #### REQUEST METHODS ####
    //  #########################
    /**
     * This method retrieves the language list in ISO-639-1 format that is used to syncronize the two letter language combination
     * with the actual language spoken name which in turn is used for the label used within the subtitles tracks, menu and within the DOM structure.
     * @private
     * @param callback
     */
    var _getISO_639_1_Json = function(callback){
        var xhr = new XMLHttpRequest(),
            url = settingsObject.iso6391Url;

        xhr.open('GET', url, true);
        xhr.responseType = 'application/json';
        xhr.send();

        xhr.onload = function(e) {
            if (xhr.status != 200) {
                messagesModule.printOutWarning("Unexpected status code " + xhr.status + " for " + url);
                return false;
            }
            callback(xhr.response);
        };
    };

    //  ####################################
    //  #### PLAYER API CONTROL METHODS ####
    //  ####################################
    /**
     * @function
     * @name pause
     * @description This method interacts with the player video element and pauses the stream/media
     * @public
     */
    var pause = function(){
        that._videoElement.pause();
    };

    /**
     * @function
     * @name play
     * @description This method interacts with the player video element and starts to play the stream/media
     * @public
     */
    var play = function(){
        that._videoElement.play();
    };

    /**
     * @function
     * @name fullscreen
     * @description This method interacts with the player video element generates or exists a fullscreen mode
     * @public
     */
    var fullscreen = function(){
        if (_isFullScreen()) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
        else {
            if (that._videoElement.requestFullscreen) that._videoElement.requestFullscreen();
            else if (that._videoElement.mozRequestFullScreen) that._videoElement.mozRequestFullScreen();
            else if (that._videoElement.webkitRequestFullScreen) that._videoElement.webkitRequestFullScreen();
            else if (that._videoElement.msRequestFullscreen) that._videoElement.msRequestFullscreen();
        }
    };

    /**
     * A fullscreen check method for the public API
     * @returns {boolean}
     * @private
     */
    var _isFullScreen = function() {
        return !!(document.fullScreen
        || document.webkitIsFullScreen
        || document.mozFullScreen
        || document.msFullscreenElement
        || document.fullscreenElement);
    };

    /**
     * @function
     * @name seek
     * @description This method interacts with the player video element and seeks within the stream/media
     * @public
     * @param {number | string} positionInSeconds - The position since start, we want the player to skip to, should be an integer from 0 and up.
     */
    var seek = function(positionInSeconds){
        try {
            that._videoElement.currentTime = positionInSeconds;
        } catch (e) {
            var messageObject = {};
                messageObject.message = 'Could not seek to position, check that input is number';
                messageObject.methodName = 'seek';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @function
     * @name setVolume
     * @description This method interacts with the player video element and sets the volume within the stream/media
     * @public
     * @param {number | string} numberFromZeroToOne - A decimal number from 0 to 1, like 0.5 for instance
     */
    var setVolume = function(numberFromZeroToOne){
        try {
            that._videoElement.volume = numberFromZeroToOne;
        } catch (e) {
            var messageObject = {};
                messageObject.message = 'Could not set volume, check that input is number from 0 to 1';
                messageObject.methodName = 'setVolume';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @function
     * @name getVolume
     * @description This method returns the video element volume as a number between 0 and 1.
     * @public
     * @returns {*|Number}
     */
    var getVolume = function(){
        return that._videoElement.volume;
    };

    //  #########################
    //  #### GENERAL METHODS ####
    //  #########################
    /**
     * @function
     * @name getVersion
     * @description This is a helper method to get the current version of the player library
     * @public
     * @returns {string}
     */
    var getVersion = function(){
        return moduleVersion;
    };

    /**
     * @function
     * @name getName
     * @description This is a helper method to get the current name of the player library
     * @public
     * @returns {string}
     */
    var getName = function(){
        return moduleName;
    };

    /**
     * @function
     * @name isModule
     * @description This method returns a boolean with true if the object/calling it is a module to Free Video Player or not
     * @returns {boolean}
     * @public
     */
    var isModule = function(){
        return isModuleValue;
    };

    /**
     * This method parses through the videoUrl and returns the type of stream based on the ending of the videoUrl
     * @private
     * @param videoUrl
     * @returns {string}
     */
    var _returnStreamTypeBasedOnVideoUrl = function(videoUrl){
        var streamType = 'dash',
            videoUrlArray = [],
            streamTypeEnding = '';

        try {
            videoUrlArray = videoUrl.split('.');
            streamTypeEnding = videoUrlArray.pop().toLowerCase();

            switch (streamTypeEnding){

                case 'mp4' :
                    streamType = 'mp4';
                    break;

                case 'webm' :
                    streamType = 'webm';
                    break;

                case 'ogg' :
                    streamType = 'ogg';
                    break;

                case 'mpd' :
                    streamType = 'dash';
                    break;

                case 'm3u8' :
                    streamType = 'hls';
                    break;

                default :
                    streamType = 'mp4';
            }

        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not determine stream type, check videoUrl as input';
                messageObject.methodName = 'returnStreamTypeBasedOnVideoUrl';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return streamType;
    };

    /**
     * This method clears the current video container, to make room for a new video instance
     * @private
     */
    var _clearVideoContainer = function(){
        try {
            var videoWrapper = document.querySelectorAll('.' + settingsObject.videoWrapperClassName)[0];
            try {
                var videoElement = videoWrapper.getElementsByTagName('video')[0];
                videoElement.src = '';
            }  catch (e){
                //Do nothing here, this is done when we first load aswell.
            }
            videoWrapper.innerHTML = '';
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not clear videoElement from videoWrapper, checkt accessibility in DOM';
                messageObject.methodName = 'clearVideoContainer';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * This method clears the current video object properties that need to be cleared between plays
     * @private
     */
    var _clearCurrentVideoObjectProperties = function(){
        //Add more stuff that needs clearing here
        currentVideoObject.subtitleTracksArray = [];
        //Lets clear all timestamps for the next stream
        currentVideoObject.adaptiveStreamBitrateObjectMap.clear();
        currentVideoObject.currentVideoBaseUrl = 'auto';
    };

    /**
     * This methods clears previous video containers, buffers and such. An aggregated top layer function for clearing previous video instances and such.
     * @private
     */
    var _clearVideo = function(){
        _clearCurrentVideoObjectProperties();
        _clearVideoContainer();
        if(adaptiveStreamingModule){
            adaptiveStreamingModule.abortSourceBuffers();
            //adaptiveStreamingModule.clearMediaSource();
            adaptiveStreamingModule.clearCurrentVideoStreamObject();
        }
    };

    //  ############################
    //  #### INITIATION METHODS ####
    //  ############################
    /**
     * This method loads the general subtitle info
     * @private
     */
    var _loadGeneralSubtitleInfo = function(){
        //Try to optimize this
        //and maybe save this list within a cookie in
        //the browser later?
        _getISO_639_1_Json(function(response){
            //Lets save our subtitle ISO-639-1 configuration to the class
            //so we can use it to verify with the subtitles retrieved when fetching a MPD for instance
            videoPlayerObject.subtitleLanguageObject = JSON.parse(response) || [];
        });
    };

    /**
     * This method is just a helper method that prints a message on the console when the video player is instantiated
     * @private
     */
    var _printStartMessageToConsole = function(){
        if(settingsObject.debugMode){
            var messageObject = {};
            messageObject.message = 'Started ' + moduleName + ' with version: ' + moduleVersion;
            messageObject.methodName = 'printStartMessageToConsole';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################

    //Loading
    that.load = load;

    //Player methods
    that.pause = pause;
    that.play = play;
    that.seek = seek;
    that.setVolume = setVolume;
    that.fullscreen = fullscreen;

    //General Methods
    that.getName = getName;
    that.getVersion = getVersion;
    that.isModule = isModule;

    //Other sdk methods
    that.getArrayOfSubtitleObjects = getArrayOfSubtitleObjects;

    //  ###############
    //  #### START ####
    //  ###############
    //  Lets load subtitle info for parsing labels from the ISO-639-1
    //  standard first, then show a console message that instantiation went well.
    _loadGeneralSubtitleInfo();
    _printStartMessageToConsole();

    //lets return the actual object
    return that;
};





