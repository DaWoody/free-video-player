/**
 * @name FREE VIDEO PLAYER - ADAPTIVE STREAMING MODULE
 * @module FREE VIDEO PLAYER - ADAPTIVE STREAMING MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A  module that handles the actual methods for using the Media Source Extension and playing streaming formats, to use with the FREE VIDEO PLAYER library. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param moduleVersion {string} - The videoControlsModule that the Free Video Player uses
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStream = function(settingsObject, videoControlsModule){
    //Add stuff here and refactor so we gather adaptive streaming stuff in one module

    //SEEMS TO BE NEEDING MediaSource, VideoElement, VideoWrapper, CurrentVideoObject
    // and such, lets see how we solve the issues..
    'use strict';

    var that = {},
        settingsObject = settingsObject,
        isModuleValue = true,
        moduleName = 'ADAPTIVE STREAMING',
        moduleVersion = '0.9.0',
        currentVideoObject = {},
        adaptiveBitrateAlgorithmValue = new Map();
        currentVideoObject.streamObject = _returnClearCurrentVideoStreamObject();

    //Import dependencies and modules
    var mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, moduleVersion),
        videoControlsModule = videoControlsModule || null,
        hlsParserModule = 'Add HLS PARSER HERE...';

    //Populate value in map, used for adaptive bitrate algorithm,
    //these values are used for threshold values in miliseconds,
    //when a switch shold occur.
    adaptiveBitrateAlgorithmValue.set('lowest', 1500);
    adaptiveBitrateAlgorithmValue.set('secondLowest', 2500);
    adaptiveBitrateAlgorithmValue.set('middle', 3500);
    adaptiveBitrateAlgorithmValue.set('highest', 6000);

    //Create methods here
    //Some methods we will be using for the player here. We will write them like the way we do. Just the way it should be.
    //Awesomeness.
    //  ############################
    //  #### INITIATION METHODS ####
    //  ############################
    /**
     * A startup method to show startup messages when the module is started
     * @public
     */
    function printOutOnStartup(){
        if(browserSupportsMediaSource()){
            var messageObject = {};
            messageObject.message = 'Adaptive Bitrate Module - started with support for MSE';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutMessageToConsole(messageObject);
        } else {
            var messageObject = {};
            messageObject.message = 'ERROR - Adaptive Bitrate Module - Browser do not support MSE';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    //Initiation method
    /**
     * The initiation method starts up the module with other methods
     * @private
     */
    function _initiate(){
        printOutOnStartup();
    };

    //  ###############################
    //  #### SOURCE BUFFER METHODS ####
    //  ###############################
    /**
     * This method abort the source buffers, can be used when reloading/loading an asset.
     * @private
     */
    function abortSourceBuffers(currentVideoObject){
        try {
            console.log('Reached abort source buffers');
            var sourceBuffers = currentVideoObject.streamObject.sourceBuffers;
            for(var i = 0, sourceBuffersLength = sourceBuffers.length; i < sourceBuffersLength; i++){
                //Source buffer
                console.log('Trying to abort source buffer stream index ' + i);
                sourceBuffers[i].abort();
            }
            currentVideoObject.streamObject.sourceBuffers = [];
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not abort source buffers, check accessibility';
                messageObject.methodName = 'abortSourceBuffers';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }

        //Should we just return that module or the videoStreamingObject
    };

    //  #########################
    //  #### BITRATE METHODS ####
    //  #########################
    /**
     * Returns the baseUrl that the users stored from the video controls menu
     * @returns {string}
     * @private
     */
    var _returnBaseUrlBasedOnStoredUserSettings = function(){
        console.log('Base URL set by user!');
        var returnBaseUrl = currentVideoObject.streamObject.currentVideoBaseUrl;
        return returnBaseUrl;
    };

    /**
     * Checks if the bitrate is set to auto, this can be used as a flag to determine if the user wants
     * to overwrite the automagic bitrate algorithm
     * @returns {boolean}
     * @private
     */
    var _isBitrateAuto = function(){
        var bitrateIsAudio = false;
        console.log('The currentVideoStreamObject current VideBaseUrl is ..' + currentVideoObject.streamObject.currentVideoBaseUrl);
        if(currentVideoObject.streamObject.currentVideoBaseUrl === 'auto'){
            bitrateIsAudio = true;
        }
        return bitrateIsAudio;
    };

    //  ########################################
    //  #### MEDIA SOURCE EXTENSION METHODS ####
    //  ########################################
    /**
     * Checks if the browser supports this media source
     * @returns {boolean}
     */
    function browserSupportsMediaSource(){
      var browserSupportsMediaSourceExtension = false,
          mediaSource = new MediaSource() || null;

        if(mediaSource){
            browserSupportsMediaSourceExtension = true;
        }
        return browserSupportsMediaSourceExtension;
    };

    /**
     * @function
     * @name loadDashMediaWithMediaSourceExtension
     * @description A method that utilizes sub-methods to start the DASHed resource, through using the Media Source Extension object found within the browser, this method actually fires up the video streaming methods and activates source buffers and more.
     * @param {object} adaptiveVideoObject - A javascript object containing configuration such as videoWrapperClassName, optionalConfigurationObject, mpdObject, hlsObject
     * @public
     */
    function loadDashMediaWithMediaSourceExtension(adaptiveVideoObject){

        var videoWrapperClassName = adaptiveVideoObject.videoWrapperClassName,
            optionalConfigurationObject = adaptiveVideoObject.optionalConfigurationObject,
            mpdObject = adaptiveVideoObject.mpdObject,
            hlsObject = adaptiveVideoObject.hlsObject;

        //Lets set our class scoped currentVideoObject to the stuff we get in when the load dash method is called.
        currentVideoObject = adaptiveVideoObject.currentVideoObject,
        currentVideoObject.streamObject = _returnClearCurrentVideoStreamObject();

        currentVideoObject.streamObject.streamBaseUrl = adaptiveVideoObject.streamBaseUrl;

        //Lets add the mpdObject to our currentVideoStreamObject
        mpdObject ?  currentVideoObject.streamObject.mpdObject = mpdObject : adaptiveVideoObject.mpdObject = {};
        hlsObject ?  currentVideoObject.streamObject.hlsObject = hlsObject : adaptiveVideoObject.hlsObject = {};

        _initiateMediaSource();
        _createVideoElementAndAppendToWrapper(videoWrapperClassName);
        _createMediaSourceStream(currentVideoObject.streamObject.streamBaseUrl, optionalConfigurationObject);
        _addEventListenersToMediaSource();
    };

    /**
     * This method initiates the media source extension and creates a video element aswell.
     * @private
     */
    function _initiateMediaSource(){
        //Add the mediaSource to the class scoped storage
        that._mediaSource = new MediaSource();
    };

    /**
     * This method creates the media source stream
     * @private
     * @param baseUrl
     */
    function _createMediaSourceStream(baseUrl, optionalConfigurationObject){
        console.log('## LOADING VIDEO WITH URL ' + baseUrl);
        //Lets try loading it
        currentVideoObject.streamObject.streamBaseUrl = baseUrl;

        that._videoElement.src = window.URL.createObjectURL(that._mediaSource);

        if(optionalConfigurationObject){
            that._videoElement.poster = optionalConfigurationObject.videoSplashImageUrl ? optionalConfigurationObject.videoSplashImageUrl : settingsObject.videoSplashImageUrl;
        } else {
            that._videoElement.poster = settingsObject.videoSplashImageUrl;
        }
    };

    /**
     * Creates a video element
     * @param that
     * @param videoWrapperClassName
     * @returns {*}
     */
    function _createVideoElementAndAppendToWrapper(videoWrapperClassName){
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


    //  #######################
    //  #### VIDEO METHODS ####
    //  #######################


    /**
     * @function
     * @name addStreamBaseUrl
     * @description Adds the streamBaseUrl to the class/module scoped variable streamBaseUrl.
     * @param {string} streamBaseUrl - The stream baseUrl we want to add to the currentVideoStreamObject
     * @public
     */
    function addStreamBaseUrl(streamBaseUrl){
        currentVideoObject.streamObject.streamBaseUrl = streamBaseUrl;
    };

    /**
     * @function
     * @name _getStreamBaseUrl
     * @description Gets the streamBaseUrl from the class/module scoped variable
     * @returns {*}
     * @private
     */
    function _getStreamBaseUrl(){
      return currentVideoObject.streamObject.streamBaseUrl;
    };

    /**
     * This is the main media method for adpative bitrate content when the video and mediasource object are ready,
     * this is currently used in conjunction with the mpdParserModule and the DASH format for streaming content.
     * @private
     * @param e
     */
     function _videoready (e) {

        console.log('Reached _videoReady function');

        var adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromMpdObject(currentVideoObject.streamObject.mpdObject),
            representationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(adaptionSets[0]),
            videoBufferAdded = false,
            audioBufferAdded = false,
            streamBaseUrl = _getStreamBaseUrl(),
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
                streamDurationInSeconds =  mpdParserModule.returnMediaDurationInSecondsFromMpdObject(currentVideoObject.streamObject.mpdObject),
                startValue = mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                segmentPrefix = mediaObject.segmentPrefix,
                segmentEnding = mediaObject.segmentEnding,
                averageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject(currentVideoObject.streamObject.mpdObject),
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
                currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
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
                currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
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
                currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
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

                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex' , baseUrlObjectsArrayHighestIndex);
            } else {
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex', 0);
            }

            if(!isSubtitleTrack){

                initializationFile = mpdParserModule.returnInitializationFromSegmentTemplate(segmentTemplate);

                var bitrateSettingObject = {};
                bitrateSettingObject.baseUrlObjectArray = baseUrlObjectArray;
                bitrateSettingObject.typeOfStream = typeOfStream;

                //Lets try updating our videoControls
                _updateVideoControlsWithBitrateSettings(bitrateSettingObject);

                //These two following should probably be rewritten and changed
                sourceBuffer.addEventListener('updatestart', function(){
                    console.log('Should start with update... sourceBuffer.updating should be true..' + sourceBuffer.updating);
                    //videoControlsModule.addSpinnerIconToVideoOverlay();
                });

                sourceBuffer.addEventListener('update', function(){
                    console.log('Should be done with update... sourceBuffer.updating should be false..' + sourceBuffer.updating);
                    //videoControlsModule.removeSpinnerIconFromVideoOverlay();
                });

                //When we are done updating
                sourceBuffer.addEventListener('updateend', function() {
                    if(that._videoElement.error)
                        console.log(that._videoElement.error);
                    if( sourceBuffer.buffered.length > 0 )
                        console.log(mimeType + ' buffer timerange start=' + sourceBuffer.buffered.start(0) + ' / end=' + sourceBuffer.buffered.end(0));
                    sourceCount++;


                    console.log('The stream duration is.. ' + streamDurationInSeconds);
                    console.log('The average segment length is ' + averageSegmentDuration);
                    var amountOfSegments = Math.round(streamDurationInSeconds/averageSegmentDuration);

                    console.log('The amount of segments should be around.. ' + amountOfSegments);

                    if( sourceCount > amountOfSegments
                        && MediaSource.readyState == 'open') {
                        //Lets end stream when we have reached the end of our stream count
                        that._mediaSource.endOfStream();
                        return;
                    }

                    //Lets add the baseUrlObjectArray to the specific sourceBuffer (stream type).
                    currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectArray);

                    //Lets switch baseUrl here..
                    //We first evaulate if we want to bitrate switch from user settings or from adaptive algorithm

                    //FIX SO THIS ONLY WORKS FOR VIDEO AND NOT AUDIO
                    if(!_isBitrateAuto()
                        && typeOfStream !== 'audio'){
                        baseUrl = _returnBaseUrlBasedOnStoredUserSettings();
                        console.log('User set bitrate! :)');
                        console.log('THE BASE URL WE TRY TO SET IS THIS.. ' + baseUrl + ' .. with type ' + typeOfStream);
                    } else {
                        baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);
                        console.log('THE BASE URL SET BY THE ALGORITHM IS THIS..' + baseUrl + ' .. with type ' + typeOfStream);
                    }

                    setTimeout(function(){
                        _appendData(sourceBuffer,
                            currentVideoObject.streamObject.streamBaseUrl +
                            baseUrl +
                            segmentPrefix +
                            sourceCount +
                            segmentEnding,
                            mimeType);
                    }, sourceBufferWaitBeforeNewAppendInMiliseconds);
                });

                console.log('source buffer ' + index + ' mode: ' + sourceBuffer.mode );
                _appendData(sourceBuffer, currentVideoObject.streamObject.streamBaseUrl + baseUrl + initializationFile, mimeType);

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

    //  ########################
    //  #### BUFFER METHODS ####
    //  ########################
    /**
     * This method checks the buffers
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
     * This methods sets the media source duration for the media source extension and the source buffer
     * @private
     * @param arrayOfSourceBuffers
     */
    function _setMediaSourceDuration(arrayOfSourceBuffers) {

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

    /**
     * This methods does the actual appending of the data for the source buffers
     * @private
     * @param buffer {buffer}
     * @param file {file}
     * @param type {string}
     */
    function _appendData(buffer, file, type) {
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
     * This methods gets the array buffer which is actually the streams that will be used by the media source extension object.
     * @private
     * @param url {string}
     * @param callback {function}
     */
    function _getArrayBuffer(url, callback) {
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
     * This method adds eventlisteners to the media source object
     * @private
     */
    function _addEventListenersToMediaSource(){
        //  ### EVENT LISTENERS ###
        that._mediaSource.addEventListener('sourceopen', _videoready, false);
        that._mediaSource.addEventListener('webkitsourceopen', _videoready, false);

        that._mediaSource.addEventListener('webkitsourceended', function(e) {
            console.log('mediaSource readyState: ' + this.readyState);
        }, false);
        return that;
    };

    /**
     * @function
     * @name clearMediaSource
     * @description This method clears the current media source that has been appended to the inner variable currentVideoStreamObject
     * @public
     */
    function clearMediaSource(){
        try {
            that._mediaSource = null;
            //Have we cleared enough here..
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not clear mediaSource element, check accessibility in DOM';
                messageObject.methodName = 'clearMediaSource';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return that;
    };

    //  #############################################
    //  #### CURRENT VIDEO STREAM OBJECT METHODS ####
    //  #############################################
    /**
     * @function
     * @name clearCurrentVideoStreamObject
     * @description This method clears the current video object properties that need to be cleared between plays
     * @public
     */
    function clearCurrentVideoStreamObject(){
        currentVideoObject.streamObject = _returnClearCurrentVideoStreamObject();
    };

    /**
     * A method to return a resetd currentVideoStreamObject, new parameters, cleared and such
     * @returns {{bitrateSwitchTimerSegmentAppendTime: number, currentVideoBitrateIndex: number, sourceBuffers: Array, mpdObject: {}, hlsObject: {}, adaptiveStreamBitrateObjectMap: Map, currentVideoBaseUrl: string, streamBaseUrl: string}}
     * @private
     */
    function _returnClearCurrentVideoStreamObject(){
        var returnObject = {
            bitrateSwitchTimerSegmentAppendTime:0,
            currentVideoBitrateIndex:0,
            sourceBuffers: [],
            mpdObject: {},
            hlsObject: {},
            adaptiveStreamBitrateObjectMap: new Map(),
            //used for the adaptive bitrate algo, should probably be refactored later
            currentVideoBaseUrl:'auto',
            streamBaseUrl:''
        };
        return returnObject;
    }

    //  #########################
    //  #### BITRATE METHODS ####
    //  #########################
    /**
     * A method that first verifies that the videoControlsModule is in use, then tries to contact
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

    /**
     * This method takes the baseUrlObjectsArray and then parses through that to find
     * out which bitrate should be used
     * @param baseUrlObjectsArray
     * @returns {string}
     * @private
     */
    function _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream){

        var baseUrl = '',
            currentTime = 0,
            baseUrlIndex = 0,
            timeDifferenceFromLastAppendedSegment = 0,
            lowestValue = adaptiveBitrateAlgorithmValue.get('lowest'),
            secondLowestValue = adaptiveBitrateAlgorithmValue.get('secondLowest'),
            middleValue = adaptiveBitrateAlgorithmValue.get('middle'),
            highestValue = adaptiveBitrateAlgorithmValue.get('highest'),
            baseUrlObjectsArray = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray');

        //When we start we should start at lowest
        //Then we should try going up as fast as we can -> so if first segment took a bit of time
        try {
            currentTime = new Date().getTime();

            if(!currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.has(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime')){
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime);
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectsArray);
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            timeDifferenceFromLastAppendedSegment = currentTime - currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime');

            // Lets add a swtich block here
            if(timeDifferenceFromLastAppendedSegment == 0){
                var currentIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');
                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                // Lets set our index to the lowest value then make it higher as soon as we start
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            if(timeDifferenceFromLastAppendedSegment < lowestValue){
                // Lets go high directly since latency is low
                console.log('Switching to highest bitrate - dl time less than ' + lowestValue);
                var highestIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');
                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[highestIndex].baseUrl;
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', highestIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= lowestValue
                && timeDifferenceFromLastAppendedSegment < secondLowestValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Switching to higher bitrate - dl time less than 2500, higher than ' + lowestValue);
                var currentIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex'),
                    highestIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');

                if(currentIndex < highestIndex){
                    baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex + 1].baseUrl;
                    currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex + 1);
                } else {
                    baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }
            }

            if(timeDifferenceFromLastAppendedSegment >= secondLowestValue
                && timeDifferenceFromLastAppendedSegment < middleValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Staying at this bitrate - dl time more than ' + secondLowestValue + ', less than ' + middleValue);
                var currentIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= middleValue
                && timeDifferenceFromLastAppendedSegment < highestValue){
                // Lets go down a notch since the dl time was more than 3500 ms
                //  but the dl time was not more than 6000 ms so we should try going down just one notch
                //  Awesomeness lets see how this works
                console.log('Switching to lower bitrate - dl time higher than ' +  middleValue + ' but lower than ' + highestValue);
                var currentIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                if(currentIndex > 0){
                    baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex - 1].baseUrl;
                    currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex - 1);
                } else {
                    baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }
            }

            if(timeDifferenceFromLastAppendedSegment >= highestValue){
                // Lets go high directly since latency is low
                console.log('Switching to lowest bitrate - dl time more than ' + highestValue);
                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[0].baseUrl;
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }
            //lets overwrite our current time to the time we had now
            currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime)
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse base url from the baseUrlObjectsArray';
                messageObject.methodName = '_returnBaseUrlBasedOnBitrateTimeSwitch';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return baseUrl;
    };

    //  ################################
    //  #### ADD DEPENDENCY METHODS ####
    //  ################################


    //  #########################
    //  #### GENERAL METHODS ####
    //  #########################

    /**
     * @function
     * @name getVersion
     * @description This method gets the module version
     * @returns {string} - the module version as a string
     * @public
     */
    function getVersion(){
        return moduleVersion;
    };

    /**
     * @function
     * @name getName
     * @description This method gets the module name
     * @returns {string} - the module name as a string
     * @public
     */
    function getName(){
        return moduleName;
    };


    /**
     * @function
     * @name isModule
     * @description This method returns a boolean with true if the object/calling it is a module to Free Video Player or not
     * @returns {boolean}
     * @public
     */
    function isModule(){
        return isModuleValue;
    };


    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################

    //currentVideoObject methods
    that.addStreamBaseUrl = addStreamBaseUrl;
    that.clearCurrentVideoStreamObject = clearCurrentVideoStreamObject;

    //Media Source Extension methods
    that.loadDashMediaWithMediaSourceExtension = loadDashMediaWithMediaSourceExtension;
    that.browserSupportsMediaSource = browserSupportsMediaSource;

    that.abortSourceBuffers = abortSourceBuffers;
    that.clearMediaSource = clearMediaSource;

    //General Methods
    that.getName = getName;
    that.getVersion = getVersion;
    that.isModule = isModule;

    //Lets run this method on startup
    _initiate();

    //Lets return our object
    return that;
};
