/**
 * @name FREE VIDEO PLAYER
 * @author Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @classdesc A cool FREE VIDEO PLAYER library to use when want to play DASHed content, Requires the xml2json library to work
 * @version 0.9.0
 * http://www.freevideoplayer.org
 * @param initiationObject
 */
var freeVideoPlayer = function(initiationObject){

    'use strict';

    //  ################################
    //  #### VARIABLE INSTANTIATION ####
    //  ################################
    var that = {
            version:'0.9.0'
        },//videoConstructor(),
        moduleName = 'Free Video Player',
        videoPlayerNameCss = 'free-video-player',
        xml2json = new X2JS(),
        defaultSettingsObject = {
            videoWrapperClassName: 'js-' + videoPlayerNameCss + '-container',
            videoWrapperBackgroundColor: '#292c3c',
            videoSplashImageUrl:'../images/free-video-player-logo-dark.png',
            iso6391Url:'/js/freevideoplayer/subtitles/iso-639-1.json',
            videoControlsInnerHtml : {
                playIconInnerHtml:'<i class="fa fa-play"></i>',
                pauseIconInnerHtml:'<i class="fa fa-pause"></i>',
                stopIconInnerHtml:'<i class="fa fa-stop"></i>',
                volumeHighIconInnerHtml:'<i class="fa fa-volume-up"></i>',
                volumeLowIconInnerHtml:'<i class="fa fa-volume-down"></i>',
                novolumeIconInnerHtml:'<i class="fa fa-volume-off"></i>',
                fullscreenExpandIconInnerHtml:'<i class="fa fa-expand"></i>',
                fullscreenCompressIconInnerHtml:'<i class="fa fa-compress"></i>',
                spinnerIconInnerHtml: '<i class="fa fa-spinner fa-spin"></i>',
                subtitlesMenuInnerHtml:'CC',
                subtitlesMenuOffButtonInnerHtml:'Off'
            },
            videoControlsCssClasses: {
                videoControlsClass: videoPlayerNameCss + '-controls',
                videoFullScreenClass: videoPlayerNameCss + '-controls-fullscreen',
                playpauseContainerClass: videoPlayerNameCss + '-controls-playpause',
                subtitlesContainerClass: videoPlayerNameCss + '-controls-subtitles',
                progressbarContainerClass: videoPlayerNameCss + '-controls-progress',
                progressTimerContainerClass: videoPlayerNameCss + '-controls-progress-timer',
                volumeContainerClass: videoPlayerNameCss + '-controls-volume',
                fullscreenContainerClass: videoPlayerNameCss + '-controls-fullscreen',
                subtitlesMenuClass: videoPlayerNameCss + '-controls-subtitles-menu',
                subtitleButtonClass: videoPlayerNameCss + '-controls-subtitles-button',
                hideControlClass: videoPlayerNameCss + '-controls-hide',
                displayControlClass: videoPlayerNameCss + '-controls-display',
                hideVideoOverlayClass: videoPlayerNameCss + '-controls-overlay-hide',
                showVideoOverlayClass: videoPlayerNameCss + '-controls-overlay-show',
                videoOverlayIconClass: videoPlayerNameCss + '-controls-overlay-icon'
            },
            videoControlsDisplay: {
                showPlayPauseButton: true,
                showProgressSlider: true,
                showVolumeIcon:true,
                showVolumeSlider: true,
                showSubtitlesMenu: true,
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
        videoWrapperClassName = settingsObject.videoWrapperClassName,
        streamBaseUrl = settingsObject.streamBaseUrl,
        adaptiveBitrateAlgorithmValue = new Map();

    //Populate value in map, used for adaptive bitrate algorithm,
    //these values are used for threshold values in miliseconds,
    //when a switch shold occur.
    adaptiveBitrateAlgorithmValue.set('lowest', 1500);
    adaptiveBitrateAlgorithmValue.set('secondLowest', 2500);
    adaptiveBitrateAlgorithmValue.set('middle', 3500);
    adaptiveBitrateAlgorithmValue.set('highest', 6000);

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
        adaptiveStreamBitrateObjectMap: new Map()
    };

    var currentVideoStreamObject = {
        bitrateSwitchTimerSegmentAppendTime:0,
        currentVideoBitrateIndex:0,
        sourceBuffers: []
    };

    //Add references to helper libraries
    var mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        videoControlsModule = freeVideoPlayerModulesNamespace.freeVideoPlayerControls(settingsObject, videoPlayerNameCss),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, that.version),
        hlsParserModule = 'Add HLS PARSER HERE...';


    //  ######################
    //  #### LOAD METHODS ####
    //  ######################
    /**
     * @description This is the main load method, this method parses the video url and based on that decides which
     * format the video is. If its an adaptive bitrate stream or a regular stream like mp4 for instance.
     * @public
     * @param {string} videoUrl
     */
    var load = function(videoUrl){
        //This method will understand
        var streamType = _returnStreamTypeBasedOnVideoUrl(videoUrl);
        //Lets clear the video container first
        _clearCurrentVideoObjectProperties();
        _clearVideoContainer();
        _clearMediaSource();
        _abortSourceBuffers();

        //Lets set background of videoPlayer instance
        //and make it sweet ;)
        that._videoWrapper = document.querySelector('.' + videoWrapperClassName);
        that._videoWrapper.setAttribute('style', 'background:' + settingsObject.videoWrapperBackgroundColor + ';');

        switch (streamType){
            case 'mp4' : //Start video as an mp4
                _loadNonAdaptiveVideo(videoUrl, 'mp4');
                break;

            case 'ogg' : //Start video as an mp4
                _loadNonAdaptiveVideo(videoUrl, 'ogg');
                break;

            case 'webm' :
                _loadNonAdaptiveVideo(videoUrl, 'webm');
                break;

            case 'dash' : //Start video as dash
                _loadMpd(videoUrl);
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
                messagesModule.printOutErrorMessageToConsole(messageObject);
        }
    };

    /**
     * @description This is the method that loads a non adaptive bitrate stream, like for instance mp4 into the player
     * @private
     * @param {string} videoUrl
     * @param {string} typeOfVideo
     */
    var _loadNonAdaptiveVideo = function(videoUrl, typeOfVideo){
        //Load the video as a non adaptive video here
        try {
            //Set a flag to decide what kind of stream is played.
            currentVideoObject.adaptiveStream = false;
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
            that._videoElement.poster = settingsObject.videoSplashImageUrl;

            that._videoElement.addEventListener('durationchange', function(){
                currentVideoObject.mediaDurationInSeconds = that._videoElement.duration;
            });

            //Ok fetching the video wrapper which we previously defined in the load method.
            that._videoWrapper.appendChild(videoElement);

            if(settingsObject.createControls){
                //If we want to create the video controls our selves
                videoControlsModule.createVideoControls(that._videoWrapper, currentVideoObject);
            }
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not create and load non-adaptive-video stream, check input type and videoUrl';
                messageObject.methodName = 'loadNonAdaptiveVideo';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @private
     * @param {object} videoElement
     * @private
     */
    var _addEventListenersToVideoElement = function(videoElement){
        try {
            //Add methods to add event listeners to the video element
            //Do we need to add more event Listeners to the video element here?
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not add event listeners to the videoElement, check input';
                messageObject.methodName = 'addEventListenersToVideoElement';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @private
     * @param {object} videoElement
     * @private
     */
    var _removeEventListenersFromVideoElement = function(videoElement){

        try {
            //Add methods to remove the event listeners here
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not remove event listeners from the videoElement, check input';
                messageObject.methodName = 'removeEventListenersFromVideoElement';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @description This method loads the mpd and then utilizes a set of methods to parse through the MPD, adding data to
     * a scoped variable called currentVideoObject and then also firing away and starts the video
     * @private
     * @param {string} mpdUrl
     */
    var _loadMpd = function(mpdUrl){

        var responseObject = {};
        _getMpd(mpdUrl, function(response){
            try {

                currentVideoObject.adaptiveStream = true;
                responseObject = xml2json.xml_str2json(response);

                console.log('MPD');
                console.log(responseObject.MPD);

                mpdParserModule.setMpdObject(responseObject.MPD);

                currentVideoObject.averageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject();
                currentVideoObject.maxSegmentDuration = mpdParserModule.returnMaxSegmentDurationFromMpdObject();
                currentVideoObject.mediaDurationInSeconds = mpdParserModule.returnMediaDurationInSecondsFromMpdObject();
                //Lets set our streamBaseUrl based on the mpdUrl
                streamBaseUrl = mpdParserModule.returnStreamBaseUrlFromMpdUrl(mpdUrl);
                //Lets add methods so we can parse the mpd already here and decide if
                //there are subtitles to be added or not
                currentVideoObject.subtitleTracksArray = mpdParserModule.returnArrayOfSubtitlesFromMpdObject();
                currentVideoObject.subtitleTracksArray = _returnModifiedArrayOfSubtitlesWithLabel(currentVideoObject.subtitleTracksArray, videoPlayerObject.subtitleLanguageObject);

                //Lets create objects we need to perform the streaming
                //Lets initiate the media source now if the stream is
                //and adaptive bitstream
                //Add a new Media Source object and methods to that.
                _initiateMediaSource();
                _createMediaSourceStream(streamBaseUrl);
                //Lets add eventListeners to the mediaSource object
                _addEventListenersToMediaSource();
                //Lets add subtitles to DOM
                _addSubtitlesTracksToDom(currentVideoObject.subtitleTracksArray);

                //Just for testing printint out the object
                console.log('Current Video Object');
                console.log(currentVideoObject);

                if(settingsObject.createControls){
                    //If we want to create the video controls our selves
                    videoControlsModule.createVideoControls(that._videoWrapper, currentVideoObject);
                }
            } catch (e){
                var messageObject = {};
                    messageObject.message = 'Could not parse input to object from xml, for the loadMpd request, check input to the xml2json library';
                    messageObject.methodName = 'loadMpd';
                    messageObject.moduleName = moduleName;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
            }
        });
    };



    //  #################################
    //  #### ADAPTIVE STREAM METHODS ####
    //  #################################


    var _adaptiveStreamGetAverageSegmentDuration = function(){

        //Lets decide if the stream is a HLS or a DASH stream

        return
    };

    var _adaptiveStreamReturnArrayOfSubtitlesFromStreamManifest = function(){


        return
    };


    //  ################################
    //  #### SUBTITLE METHODS / DOM ####
    //  ################################

    /**
     * @description Adds subtitles tracks to the DOM and the video player instance within the video element
     * @private
     * @param {array} subtitleTracksArray
     */
    var _addSubtitlesTracksToDom = function(subtitleTracksArray){
        subtitleTracksArray.forEach(function(currentSubtitleTrack, index, subtitleTracksArray){
            //Lets create a track object and append it to the video element
            var trackElement = document.createElement('track'),
                subtitleLabel = '';

            trackElement.src = currentSubtitleTrack.subtitleUrl;
            trackElement.srclang = currentSubtitleTrack.subtitleLanguage;
            trackElement.setAttribute('kind', 'subtitles');

            subtitleLabel = _returnFirstWordFromSubtitleLabel(currentSubtitleTrack.subtitleLabel);
            subtitleLabel = _returnSubtitleLabelCapitalized(subtitleLabel);

            trackElement.setAttribute('label', subtitleLabel);
            trackElement.setAttribute('data-video-player-subtitle-index', index+1);
            that._videoElement.appendChild(trackElement);
        });
    };

    /**
     * @description Helper method that returns the first word from the subtitle label in case the subtitle label
     * contains multiple words
     * @private
     * @param {string} subtitleLabel
     * @returns {*}
     */
    var _returnFirstWordFromSubtitleLabel = function(subtitleLabel){
        var modifiedSubtitleLabel = subtitleLabel;
        try {
            modifiedSubtitleLabel = modifiedSubtitleLabel.split(',')[0];
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse through the subtitle label and return the first word';
                messageObject.methodName = '_returnFirstWordFromSubtitleLabel';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return modifiedSubtitleLabel;
    };

    /**
     * @description Returns the subtitle label capitalized, like for instance Label instead of label.
     * @private
     * @param {string} subtitleLabel
     * @returns {*}
     */
    var _returnSubtitleLabelCapitalized = function(subtitleLabel){
        var modifiedSubtitleLabel = subtitleLabel;
        try {
            modifiedSubtitleLabel.trim();
            modifiedSubtitleLabel = modifiedSubtitleLabel.charAt(0).toUpperCase() + modifiedSubtitleLabel.slice(1);
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse and Capitalize the subtitle label';
                messageObject.methodName = '_returnSubtitleLabelCapitalized';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return modifiedSubtitleLabel;
    };

    /**
     * @description A return method that could be public to return the current video's subtitle infor in
     * an array of subtitleObjects containing values such as label, language, id.
     * @public
     * @returns {Array}
     */
    var getArrayOfSubtitleObjects = function(){
        return currentVideoObject.subtitleTracksArray;
    };

    //  ##################################
    //  #### SUBTITLE METHODS NON-DOM ####
    //  ##################################
    /**
     * @description This method returns a modified array of subtitle objects with labels,
     * so the subtitle objects can be used to populate the DOM structure and such.
     * @private
     * @param {array} arrayOfSubtitles
     * @param {array} arrayOfLanguageObjects
     * @returns {*}
     */
    var _returnModifiedArrayOfSubtitlesWithLabel = function(arrayOfSubtitles, arrayOfLanguageObjects){

        try {
            // Lets do some magic here. We will match the language within the arrayOfSubtitles with the
            // language within the arrayOfLanguageObjects and then copy the label from arrayOfLanguageObjects
            // to the arrayOfSubtitles
            var currentSubtitleLanguage = '';

            for(var i = 0, arrayOfSubtitlesLength = arrayOfSubtitles.length; i < arrayOfSubtitlesLength; i++){
                currentSubtitleLanguage = arrayOfSubtitles[i].subtitleLanguage;
                for(var j = 0, arrayOfLanguageObjectsLength = arrayOfLanguageObjects.length; j < arrayOfLanguageObjectsLength; j++){
                    if(currentSubtitleLanguage == arrayOfLanguageObjects[j].language){
                        arrayOfSubtitles[i].subtitleLabel = arrayOfLanguageObjects[j].label;
                    }
                }
            }
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not modify the array of subtitles with labels, check access to subtitles array and the language object array';
                messageObject.methodName = '_returnModifiedArrayOfSubtitlesWithLabel';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return arrayOfSubtitles;
    };


    /**
     * @description This method is just a helper method that prints a message on the console when the video player is instantiated
     * @private
     */
    var _printStartMessageToConsole = function(){
        if(settingsObject.debugMode){
            var messageObject = {};
                messageObject.message = 'Started ' + moduleName + ' with version: ' + getVersion();
                messageObject.methodName = 'printStartMessageToConsole';
                messageObject.moduleName = moduleName;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    //  #################################################
    //  #### STREAM METHODS - MEDIA SOURCE EXTENSION ####
    //  #################################################
    /**
     * @description This methods sets the media source duration for the media source extension and the source buffer
     * @private
     * @param arrayOfSourceBuffers
     */
    var _setMediaSourceDuration = function(arrayOfSourceBuffers) {

        if(arrayOfSourceBuffers.length){
            console.log('THe number of source buffers are ' + arrayOfSourceBuffers.length);
        }

        //audioBuffer, videoBuffer
        console.log('setMediaSource Duration reacehd');
        //if( audioBuffer.updating || videoBuffer.updating )
        //    return;
        //
        //if( audioBuffer.buffered && audioBuffer.buffered.length > 0 &&
        //    videoBuffer.buffered && videoBuffer.buffered.length > 0) {
        //    //mediaSource.duration = Math.min(abuffer.buffered.end(0), vbuffer.buffered.end(0));
        //} else {
        //    //mediaSource.duration = 0;
        //}
    }

    //function setMediaSourceDuration(arrayOfSourceBuffers){
    //
    //    //Make this method ok for multiple parameters
    //    arrayOfSourceBuffers.forEach(function(sourceBuffer, index){
    //        console.log(`Source buffer added with index number ${index}, testing fixing mediaSourceDuration`);
    //    });
    //}


    /**
     * @description This method takes the baseUrlObjectsArray and then parses through that to find
     * out which bitrate should be used
     * @private
     * @param baseUrlObjectsArray
     * @returns {string}
     * @private
     */
    var _returnBaseUrlBasedOnBitrateTimeSwitch = function(typeOfStream){

        var baseUrl = '',
            currentTime = 0,
            baseUrlIndex = 0,
            timeDifferenceFromLastAppendedSegment = 0,
            lowestValue = adaptiveBitrateAlgorithmValue.get('lowest'),
            secondLowestValue = adaptiveBitrateAlgorithmValue.get('secondLowest'),
            middleValue = adaptiveBitrateAlgorithmValue.get('middle'),
            highestValue = adaptiveBitrateAlgorithmValue.get('highest'),
            baseUrlObjectsArray = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray');

        //When we start we should start at lowest
        //Then we should try going up as fast as we can -> so if first segment took a bit of time
        try {
            currentTime = new Date().getTime();

            if(!currentVideoObject.adaptiveStreamBitrateObjectMap.has(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime')){
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime);
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectsArray);
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            timeDifferenceFromLastAppendedSegment = currentTime - currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime');

            // Lets add a swtich block here
            if(timeDifferenceFromLastAppendedSegment == 0){
                var currentIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');
                baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                // Lets set our index to the lowest value then make it higher as soon as we start
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            if(timeDifferenceFromLastAppendedSegment < lowestValue){
                // Lets go high directly since latency is low
                console.log('Switching to highest bitrate - dl time less than ' + lowestValue);
                var highestIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');
                baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[highestIndex].baseUrl;
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', highestIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= lowestValue
                && timeDifferenceFromLastAppendedSegment < secondLowestValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Switching to higher bitrate - dl time less than 2500, higher than ' + lowestValue);
                var currentIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex'),
                    highestIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');

                if(currentIndex < highestIndex){
                    baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex + 1].baseUrl;
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex + 1);
                } else {
                    baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }
            }

            if(timeDifferenceFromLastAppendedSegment >= secondLowestValue
                && timeDifferenceFromLastAppendedSegment < middleValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Staying at this bitrate - dl time more than ' + secondLowestValue + ', less than ' + middleValue);
                var currentIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= middleValue
                && timeDifferenceFromLastAppendedSegment < highestValue){
                // Lets go down a notch since the dl time was more than 3500 ms
                //  but the dl time was not more than 6000 ms so we should try going down just one notch
                //  Awesomeness lets see how this works
                console.log('Switching to lower bitrate - dl time higher than ' +  middleValue + ' but lower than ' + highestValue);
                var currentIndex = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                if(currentIndex > 0){
                    baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex - 1].baseUrl;
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex - 1);
                } else {
                    baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }

            }

            if(timeDifferenceFromLastAppendedSegment >= highestValue){
                // Lets go high directly since latency is low
                console.log('Switching to lowest bitrate - dl time more than ' + highestValue);
                baseUrl = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[0].baseUrl;
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }
            //lets overwrite our current time to the time we had now
            currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime)
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse base url from the baseUrlObjectsArray';
                messageObject.methodName = '_returnBaseUrlBasedOnBitrateTimeSwitch';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return baseUrl;
    };

    /**
     * @description This is the main media method for adpative bitrate content when the video and mediasource object are ready,
     * this is currently used in conjunction with the mpdParserModule and the DASH format for streaming content.
     * @private
     * @param e
     */
    var _videoready = function(e) {

        console.log('Reached _videoReady function');

        var adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromMpdObject(),
            representationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(adaptionSets[0]),
            videoBufferAdded = false,
            audioBufferAdded = false,
            arrayOfSourceBuffers = [];

        console.log('The adaptionsets are:');
        console.log(adaptionSets);

        console.log('The representation are:');
        console.log(representationSets);

        //lets set a start number so we actually do not currently add more than just one video and audio buffer

        adaptionSets.forEach(function(currentAdaptionSet, index, adaptionSetArray){

            var startRepresentationIndex = 0,
                adaptionSetMimeType = mpdParserModule.returnMimeTypeFromAdaptionSet(currentAdaptionSet),
                arrayOfRepresentationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(currentAdaptionSet),
                mimeType = adaptionSetMimeType ? adaptionSetMimeType : mpdParserModule.returnMimeTypeFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                segmentTemplate = mpdParserModule.returnSegmentTemplateFromAdapationSet(currentAdaptionSet),
                initializationFile = null,
                mediaObject = mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate),
                streamDurationInSeconds =  mpdParserModule.returnMediaDurationInSecondsFromMpdObject(),
                startValue = mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                segmentPrefix = mediaObject.segmentPrefix,
                segmentEnding = mediaObject.segmentEnding,
                codecs = '',
                baseUrl = '',
                baseUrlObjectArray = [],
                isVideoStream = false,
                isVideoAndAudioStream = false,
                isAudioStream = false,
                isSubtitleTrack = false,
                typeOfStream = 'video',
                sourceBuffer = null,
                sourceCount = 0,
                contentComponentArray = [],
                contentComponentArrayLength = 0,
                sourceBufferWaitBeforeNewAppendInMiliseconds = 1000;

            if(adaptionSetMimeType){
                // When we have mimeType in adaptionSet,
                // like with Bento implementation for instance
                mimeType = adaptionSetMimeType;
            } else {
                mimeType = mpdParserModule.returnMimeTypeFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
            }
            console.log('The mimeType we find is ' + mimeType);
            //Lets use the contentComponent to find out if we have a muxxed stream or not

            console.log('The representation sets are ');
            console.log(arrayOfRepresentationSets);

            //Lets set the contentComponent length, this will decide if the stream is a muxxed (video and audio) stream
            contentComponentArray = mpdParserModule.returnArrayOfContentComponentsFromAdaptionSet(currentAdaptionSet);
            contentComponentArrayLength = contentComponentArray.length;

            //Lets fix codecs here
            codecs = mpdParserModule.returnCodecsFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
            //Lets find out the baseUrl here
            baseUrl = mpdParserModule.returnBaseUrlFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);

            //Lets check what type of stream we are loading.
            //Video
            if(mimeType.indexOf('video') > -1
                && contentComponentArrayLength == 0) {
                isVideoStream = true;
            }

            //Video & Audio
            if(mimeType.indexOf('video') > -1
                && contentComponentArrayLength > 0) {
                isVideoAndAudioStream = true;
            }

            //Audio
            if(mimeType.indexOf('audio') > -1){
                isAudioStream = true;
            }

            //Subtitles
            if(mimeType.indexOf('vtt') > -1){
                isSubtitleTrack = true;
            }

            //Now lets add sourceBuffers to the streams if we already have not added the video or the audio stream
            //Video stream
            if(!videoBufferAdded
                && isVideoStream
                && !isSubtitleTrack){
                sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
                //Lets save our sourceBuffer to temporary storage
                currentVideoStreamObject.sourceBuffers.push(sourceBuffer);
                console.log('Adding a video stream!');
                //Do more stuff here and add markers for the video Stream, where should we save?
                videoBufferAdded = true;
                typeOfStream = 'video';
            }

            //Audio stream
            if(!audioBufferAdded
                && isAudioStream
                && !isSubtitleTrack){
                sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
                //Lets save our sourceBuffer to temporary storage
                currentVideoStreamObject.sourceBuffers.push(sourceBuffer);
                console.log('Adding a audio stream!');
                //Do more stuff here and add markers for the audio Stream, where should we save?
                audioBufferAdded = true;
                typeOfStream = 'audio';
            }

            //Muxxed stream
            if(!videoBufferAdded
                && isVideoAndAudioStream
                && !isSubtitleTrack){
                sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
                //Lets save our sourceBuffer to temporary storage
                currentVideoStreamObject.sourceBuffers.push(sourceBuffer);
                console.log('Adding a video and audio stream!');
                //Do more stuff here and add markers for the video & audio Stream, where should we save?
                videoBufferAdded = true;
                audioBufferAdded = true;
                typeOfStream = 'videoAndAudio';
            }

            //If we have multiple representations within the current
            //adaptionset awesomeness :)
            if(arrayOfRepresentationSets.length > 0){
                baseUrlObjectArray = mpdParserModule.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentationSets);
                //Setting this value so it can be used within the bitrate switch calculations
                var baseUrlObjectsArrayLength = baseUrlObjectArray.length,
                    baseUrlObjectsArrayHighestIndex = baseUrlObjectsArrayLength - 1;

                console.log('Setting the highest index to' + baseUrlObjectsArrayHighestIndex);
                console.log('The stream we have is..' + typeOfStream);

                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex' , baseUrlObjectsArrayHighestIndex);
            } else {
                currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex', 0);
            }

            if(!isSubtitleTrack){

                initializationFile = mpdParserModule.returnInitializationFromSegmentTemplate(segmentTemplate);
                sourceBuffer.addEventListener('updateend', function() {
                    if(that._videoElement.error)
                        console.log(that._videoElement.error);
                    if( sourceBuffer.buffered.length > 0 )
                        console.log(mimeType + ' buffer timerange start=' + sourceBuffer.buffered.start(0) + ' / end=' + sourceBuffer.buffered.end(0));
                    sourceCount++;

                    var amountOfSegments = Math.round(streamDurationInSeconds/currentVideoObject.averageSegmentDuration);

                    console.log('The amount of segments should be around.. ' + amountOfSegments);

                    if( sourceCount > amountOfSegments
                    && MediaSource.readyState == 'open') {
                        //Lets end stream when we have reached the end of our stream count
                        console.log('Calling the method endOfStream()');
                        that._mediaSource.endOfStream();
                        return;
                    }

                    //Lets add the baseUrlObjectArray to the specific sourceBuffer (stream type).
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectArray);

                    //Lets switch baseUrl here..
                    baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);

                    setTimeout(function(){
                        _appendData(sourceBuffer,
                            streamBaseUrl +
                            baseUrl +
                            segmentPrefix +
                            sourceCount +
                            segmentEnding,
                            mimeType);
                    }, sourceBufferWaitBeforeNewAppendInMiliseconds);
                });

                console.log('source buffer ' + index + ' mode: ' + sourceBuffer.mode );
                _appendData(sourceBuffer, streamBaseUrl + baseUrl + initializationFile, mimeType);

                //Lets push this sourceBuffer to the arrays of source buffers so we can use this
                //with our interval method and set media source duration
                arrayOfSourceBuffers.push(sourceBuffer);
            }
        });

        ////mediaSource.endOfStream();
        //
        //setInterval(function() {setMediaSourceDuration(audioSourceBuffer, videoSourceBuffer);}, 1000);

        //Lets fix the call to setMediaSource duration here
        //Why are we using this method..?
        //setInterval(function(){
        //    setMediaSourceDuration(arrayOfSourceBuffers);
        //}, 2000);
    };

    /**
     * @description This method checks the buffers
     * @private
     */
    var _checkBuffers = function() {
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
     * @description This methods does the actual appending of the data for the source buffers
     * @private
     * @param buffer
     * @param file
     * @param type
     */
    var _appendData = function(buffer, file, type) {
        console.log('Appending '+type+' data');
        _getArrayBuffer(file, function(uInt8Array) {

            var file = new Blob([uInt8Array], {type: type}),
                reader = new FileReader();

            reader.onload = function(e) {
                buffer.appendBuffer(new Uint8Array(e.target.result));
            };

            reader.readAsArrayBuffer(file);
        });
    };

    //  #########################
    //  #### REQUEST METHODS ####
    //  #########################
    /**
     * @description This methods gets the array buffer which is actually the streams that will be used by the media source extension object.
     * @private
     * @param url
     * @param callback
     */
    var _getArrayBuffer = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.send();

        xhr.onload = function(e) {
            if (xhr.status != 200) {
                alert("Unexpected status code " + xhr.status + " for " + url);
                return false;
            }
            callback(new Uint8Array(xhr.response));
        };
    };

    /**
     * @description This method makes the XMLHttp request and fetches the actual mpd manifest file
     * @private
     * @param url
     * @param callback
     */
    var _getMpd = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();

        xhr.onload = function(e) {
            if (xhr.status != 200) {
                alert("Unexpected status code " + xhr.status + " for " + url);
                return false;
            }
            callback(xhr.response);
        };
    };

    /**
     * @description This method retrieves the language list in ISO-639-1 format that is used to syncronize the two letter language combination
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
                alert("Unexpected status code " + xhr.status + " for " + url);
                return false;
            }
            callback(xhr.response);
        };
    };

    //  ################################
    //  #### PLAYER CONTROL METHODS ####
    //  ################################
    /**
     * @description This method interacts with the player video element and pauses the stream/media
     * @public
     */
    var pause = function(){
        that._videoElement.pause();
    };

    /**
     * @description This method interacts with the player video element and starts to play the stream/media
     * @public
     */
    var play = function(){
        that._videoElement.play();
    };

    /**
     * @description This method interacts with the player video element and seeks within the stream/media
     * @public
     * @param positionInSeconds
     */
    var seek = function(positionInSeconds){
        try {
            that._videoElement.currentTime = positionInSeconds;
        } catch (e) {
            var messageObject = {};
                messageObject.message = 'Could not seek to position, check that input is number';
                messageObject.methodName = 'seek';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @description This method interacts with the player video element and sets the volume within the stream/media
     * @public
     * @param numberFromZeroToOne
     */
    var setVolume = function(numberFromZeroToOne){
        try {
            that._videoElement.volume = numberFromZeroToOne;
        } catch (e) {
            var messageObject = {};
                messageObject.message = 'Could not set volume, check that input is number from 0 to 1';
                messageObject.methodName = 'setVolume';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
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
     * @description This is a helper method to get the current version of the player library
     * @public
     * @returns {string}
     */
    var getVersion = function(){
        return that.version;
    };

    /**
     * @description This method loads the general subtitle info
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
     * @description This method parses through the videoUrl and returns the type of stream based on the ending of the videoUrl
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
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return streamType;
    };

    /**
     * @description This method clears the current video container, to make room for a new video instance
     * @private
     */
    var _clearVideoContainer = function(){
        try {
            var videoWrapper = document.querySelectorAll('.' + settingsObject.videoWrapperClassName)[0];
            videoWrapper.innerHTML = '';
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not clear videoElement from videoWrapper, checkt accessibility in DOM';
                messageObject.methodName = 'clearVideoContainer';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
    };

    /**
     * @description This method clears the current media source
     * @private
     */
    var _clearMediaSource = function(){
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

    var _abortSourceBuffers = function(){
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

    /**
     * @description This method clears the current video object properties that need to be cleared between plays
     * @private
     */
    var _clearCurrentVideoObjectProperties = function(){
        //Add more stuff that needs clearing here
        currentVideoObject.subtitleTracksArray = [];
        //Lets clear all timestamps for the next stream
        currentVideoObject.adaptiveStreamBitrateObjectMap.clear();
    };


    //  ############################
    //  #### INITIATION METHODS ####
    //  ############################
    //Lets initiate the mediaSource objects and elements
    /**
     * @description This method initiates the media source extension and creates a video element aswell.
     * @private
     */
    var _initiateMediaSource = function(){
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
     * @description This method creates the media source stream
     * @private
     * @param baseUrl
     */
    var _createMediaSourceStream = function(baseUrl){
        console.log('## LOADING VIDEO WITH URL ' + baseUrl);
        //Lets try loading it
        streamBaseUrl = baseUrl || streamBaseUrl;
        that._videoElement.src = window.URL.createObjectURL(that._mediaSource);
        that._videoElement.poster = settingsObject.videoSplashImageUrl;
    };

    /**
     * @description This method adds eventlisteners to the media source object
     * @private
     */
    var _addEventListenersToMediaSource = function(){
        //  ### EVENT LISTENERS ###
        that._mediaSource.addEventListener('sourceopen', _videoready, false);
        that._mediaSource.addEventListener('webkitsourceopen', _videoready, false);

        that._mediaSource.addEventListener('webkitsourceended', function(e) {
            console.log('mediaSource readyState: ' + this.readyState);
        }, false);
    };

    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################
    //mpd methods
    that.load = load;
    //Player methods
    that.pause = pause;
    that.play = play;
    that.seek = seek;
    that.setVolume = setVolume;
    //General methods
    //That can be used within the API
    that.getVersion = getVersion;
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





