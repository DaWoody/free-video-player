/**
 * @title FREE VIDEO PLAYER - ADAPTIVE STREAM MODULE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @description A video controls module to use with the FREE VIDEO PLAYER library.
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 */
//Add the video controls to the namespace
freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStream = function(settingsObject, videoControlsModule){
    //Add stuff here and refactor so we gather adaptive streaming stuff in one module

    //SEEMS TO BE NEEDING MediaSource, VideoElement, VideoWrapper, CurrentVideoObject
    // and such, lets see how we solve the issues..
    'use strict';

    var that = {},
        settingsObject = settingsObject,
        moduleName = 'ADAPTIVE STREAMING',
        moduleVersion = '0.9.0',
        currentVideoObject = {},
        adaptiveBitrateAlgorithmValue = new Map(),
        currentVideoStreamObject = _returnClearCurrentVideoStreamObject();

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
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }

        //Should we just return that module or the videoStreamingObject
    };

    //  #########################
    //  #### BITRATE METHODS ####
    //  #########################
    /**
     * @description Returns the baseUrl that the users stored from the video controls menu
     * @returns {string}
     * @private
     */
    var _returnBaseUrlBasedOnStoredUserSettings = function(){
        var returnBaseUrl = currentVideoStreamObject.currentVideoBaseUrl;
        return returnBaseUrl;
    };

    /**
     * @description Checks if the bitrate is set to auto, this can be used as a flag to determine if the user wants
     * to overwrite the automagic bitrate algorithm
     * @returns {boolean}
     * @private
     */
    var _isBitrateAuto = function(){
        var bitrateIsAudio = false;
        if(currentVideoStreamObject.currentVideoBaseUrl === 'auto'){
            bitrateIsAudio = true;
        }
        return bitrateIsAudio;
    };

    //  ########################################
    //  #### MEDIA SOURCE EXTENSION METHODS ####
    //  ########################################
    /**
     * @description Checks if the browser supports this media source
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

    function loadDashMediaWithMediaSourceExtension(adaptiveVideoObject){

        var videoWrapperClassName = adaptiveVideoObject.videoWrapperClassName,
            optionalConfigurationObject = adaptiveVideoObject.optionalConfigurationObject,
            mpdObject = adaptiveVideoObject.mpdObject,
            hlsObject = adaptiveVideoObject.hlsObject;

        currentVideoStreamObject.streamBaseUrl = adaptiveVideoObject.streamBaseUrl;

        //Lets add the mpdObject to our currentVideoStreamObject
        mpdObject ?  currentVideoStreamObject.mpdObject = mpdObject : adaptiveVideoObject.mpdObject = {};
        hlsObject ?  currentVideoStreamObject.hlsObject = hlsObject : adaptiveVideoObject.hlsObject = {};

        _initiateMediaSource();
        _createVideoElementAndAppendToWrapper(videoWrapperClassName);
        _createMediaSourceStream(currentVideoStreamObject.streamBaseUrl, optionalConfigurationObject);
        _addEventListenersToMediaSource();
    };

    /**
     * @description This method initiates the media source extension and creates a video element aswell.
     * @private
     */
    function _initiateMediaSource(){
        //Add the mediaSource to the class scoped storage
        that._mediaSource = new MediaSource();
    };

    /**
     * @description This method creates the media source stream
     * @private
     * @param baseUrl
     */
    function _createMediaSourceStream(baseUrl, optionalConfigurationObject){
        console.log('## LOADING VIDEO WITH URL ' + baseUrl);
        //Lets try loading it
        currentVideoStreamObject.streamBaseUrl = baseUrl;

        that._videoElement.src = window.URL.createObjectURL(that._mediaSource);

        if(optionalConfigurationObject){
            that._videoElement.poster = optionalConfigurationObject.videoSplashImageUrl ? optionalConfigurationObject.videoSplashImageUrl : settingsObject.videoSplashImageUrl;
        } else {
            that._videoElement.poster = settingsObject.videoSplashImageUrl;
        }
    };

    /**
     * @description Creates a video element
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


    function addStreamBaseUrl(streamBaseUrl){
        currentVideoStreamObject.streamBaseUrl = streamBaseUrl;
    };

    function _getStreamBaseUrl(){
      return currentVideoStreamObject.streamBaseUrl;
    };

    /**
     * @description This is the main media method for adpative bitrate content when the video and mediasource object are ready,
     * this is currently used in conjunction with the mpdParserModule and the DASH format for streaming content.
     * @private
     * @param e
     */
     function _videoready (e) {

        console.log('Reached _videoReady function');

        var adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromMpdObject(currentVideoStreamObject.mpdObject),
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

                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex' , baseUrlObjectsArrayHighestIndex);
            } else {
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex', 0);
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
                    currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectArray);

                    //Lets switch baseUrl here..
                    //We first evaulate if we want to bitrate switch from user settings or from adaptive algorithm
                    if(_isBitrateAuto()){
                        baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);
                    } else {
                        baseUrl = _returnBaseUrlBasedOnStoredUserSettings();
                    }

                    setTimeout(function(){
                        _appendData(sourceBuffer,
                            currentVideoStreamObject.streamBaseUrl +
                            baseUrl +
                            segmentPrefix +
                            sourceCount +
                            segmentEnding,
                            mimeType);
                    }, sourceBufferWaitBeforeNewAppendInMiliseconds);
                });

                console.log('source buffer ' + index + ' mode: ' + sourceBuffer.mode );
                _appendData(sourceBuffer, currentVideoObject.streamBaseUrl + baseUrl + initializationFile, mimeType);

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
     * @description This methods sets the media source duration for the media source extension and the source buffer
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
     * @description This methods does the actual appending of the data for the source buffers
     * @private
     * @param buffer
     * @param file
     * @param type
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
     * @description This methods gets the array buffer which is actually the streams that will be used by the media source extension object.
     * @private
     * @param url
     * @param callback
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
        return that;
    };

    /**
     * @description This method clears the current media source
     * @private
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
    function clearCurrentVideoStreamObject(){
        ////Add more stuff that needs clearing here
        //that.currentVideoStreamObject.subtitleTracksArray = [];
        ////Lets clear all timestamps for the next stream
        //that.currentVideoStreamObject.adaptiveStreamBitrateObjectMap.clear();
        //that.currentVideoStreamObject.currentVideoBaseUrl = 'auto';

        currentVideoStreamObject = _returnClearCurrentVideoStreamObject();
    };

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


    /**
     * @description This method takes the baseUrlObjectsArray and then parses through that to find
     * out which bitrate should be used
     * @private
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
            baseUrlObjectsArray = currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray');

        //When we start we should start at lowest
        //Then we should try going up as fast as we can -> so if first segment took a bit of time
        try {
            currentTime = new Date().getTime();

            if(!currentVideoStreamObject.adaptiveStreamBitrateObjectMap.has(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime')){
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime);
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectsArray);
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            timeDifferenceFromLastAppendedSegment = currentTime - currentVideoObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime');

            // Lets add a swtich block here
            if(timeDifferenceFromLastAppendedSegment == 0){
                var currentIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');
                baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                // Lets set our index to the lowest value then make it higher as soon as we start
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }

            if(timeDifferenceFromLastAppendedSegment < lowestValue){
                // Lets go high directly since latency is low
                console.log('Switching to highest bitrate - dl time less than ' + lowestValue);
                var highestIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');
                baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[highestIndex].baseUrl;
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', highestIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= lowestValue
                && timeDifferenceFromLastAppendedSegment < secondLowestValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Switching to higher bitrate - dl time less than 2500, higher than ' + lowestValue);
                var currentIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex'),
                    highestIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');

                if(currentIndex < highestIndex){
                    baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex + 1].baseUrl;
                    currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex + 1);
                } else {
                    baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }
            }

            if(timeDifferenceFromLastAppendedSegment >= secondLowestValue
                && timeDifferenceFromLastAppendedSegment < middleValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                console.log('Staying at this bitrate - dl time more than ' + secondLowestValue + ', less than ' + middleValue);
                var currentIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= middleValue
                && timeDifferenceFromLastAppendedSegment < highestValue){
                // Lets go down a notch since the dl time was more than 3500 ms
                //  but the dl time was not more than 6000 ms so we should try going down just one notch
                //  Awesomeness lets see how this works
                console.log('Switching to lower bitrate - dl time higher than ' +  middleValue + ' but lower than ' + highestValue);
                var currentIndex = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                if(currentIndex > 0){
                    baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex - 1].baseUrl;
                    currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex - 1);
                } else {
                    baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                    currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
                }
            }

            if(timeDifferenceFromLastAppendedSegment >= highestValue){
                // Lets go high directly since latency is low
                console.log('Switching to lowest bitrate - dl time more than ' + highestValue);
                baseUrl = currentVideoStreamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[0].baseUrl;
                currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', 0);
            }
            //lets overwrite our current time to the time we had now
            currentVideoStreamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_bitrateSwitchTimerSegmentAppendTime', currentTime)
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

    function getModuleVersion(){
        return moduleVersion;
    };

    function getModuleName(){
        return moduleName;
    };

    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################

    //currentVideoObject methods
    that.addStreamBaseUrl = addStreamBaseUrl;
    that.addCurrentVideoObject = addCurrentVideoObject;
    that.removeCurrentVideoObject = removeCurrentVideoObject;
    that.clearCurrentVideoStreamObject = clearCurrentVideoStreamObject;

    //Media Source Extension methods
    that.loadDashMediaWithMediaSourceExtension = loadDashMediaWithMediaSourceExtension;
    that.browserSupportsMediaSource = browserSupportsMediaSource;

    that.abortSourceBuffers = abortSourceBuffers;
    that.clearMediaSource = clearMediaSource;

    //General Methods
    that.getModuleName = getModuleName;
    that.getModuleVersion = getModuleVersion;

    //DOM Methods
    //that.addEventListenersToMediaSource = addEventListenersToMediaSource;
    //that.createVideoElementAndAppendToWrapper = createVideoElementAndAppendToWrapper;

    //Indicate that the returned object is a module
    that._isModule = true;

    //Lets run this method on startup
    initiate();

    //Lets return our object
    return that;
};
