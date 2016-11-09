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
freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStream = function(settingsObject, videoControlsModule, adaptiveStreamObjectCreationModule){
    //Add stuff here and refactor so we gather adaptive streaming stuff in one module

    //SEEMS TO BE NEEDING MediaSource, VideoElement, VideoWrapper, CurrentVideoObject
    // and such, lets see how we solve the issues..
    'use strict';

    var that = {},
        settingsObject = settingsObject,
        isModuleValue = true,
        moduleName = 'ADAPTIVE STREAMING',
        moduleVersion = '0.9.8',
        currentVideoObject = {},
        adaptiveBitrateAlgorithmValue = new Map(),
        streamObjectCreationModule = adaptiveStreamObjectCreationModule,
        streamingOrderMap = new Map();

        currentVideoObject.streamObject = _returnClearCurrentVideoStreamObject();


    //Import dependencies and modules
    var mpdParserModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser(),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, moduleVersion),
        videoControlsModule = videoControlsModule || null,
        hlsParserModule = 'Add HLS PARSER HERE...';


    //Create methods here
    //Some methods we will be using for the player here. We will write them like the way we do. Just the way it should be.
    //Awesomeness.
    //  ############################
    //  #### INITIATION METHODS ####
    //  ############################
    /**
     * @function
     * @name printOutOnStartup
     * @description A startup method to show startup messages when the module is started
     * @public
     */
    function printOutOnStartup(){
        if(browserSupportsMediaSource()){
            var messageObject = {};
            messageObject.message = 'Adaptive Bitrate Module - started with support for Media Source Extension';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutMessageToConsole(messageObject);
        } else {
            var messageObject = {};
            messageObject.message = 'ERROR - Adaptive Bitrate Module - Browser do NOT support Media Source Extension';
            messageObject.methodName = 'printOutOnStartup';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };


    /**
     * @function
     * @name _initiateAdaptiveBitrateAlgorithmValue
     * @description Sets initial values, limts and border values for the adaptive bitrate algorithm
     * @param adaptiveBitrateAlgorithmValue
     * @private
     */
    function _initiateAdaptiveBitrateAlgorithmValue(adaptiveBitrateAlgorithmValue){
        //Populate value in map, used for adaptive bitrate algorithm,
        //these values are used for threshold values in miliseconds,
        //when a switch shold occur.
        adaptiveBitrateAlgorithmValue.set('lowest', 1500);
        adaptiveBitrateAlgorithmValue.set('secondLowest', 2500);
        adaptiveBitrateAlgorithmValue.set('middle', 3500);
        adaptiveBitrateAlgorithmValue.set('highest', 6000);
    }

    //Initiation method
    /**
     * @function
     * @name _initiate
     * @description initiation method starts up the module with other methods
     * @private
     */
    function _initiate(){
        printOutOnStartup();
    };

    //  ###############################
    //  #### SOURCE BUFFER METHODS ####
    //  ###############################
    /**
     * @function
     * @name abortSourceBuffers
     * @description This method abort the source buffers, can be used when reloading/loading an asset.
     * @private
     */
    function abortSourceBuffers(currentVideoObject){
        try {
            messagesModule.printOutLine('Reached abort source buffers');

            //Utilizing methods for media source extension
            //Read more @
            //https://w3c.github.io/media-source/#mediasource-detach
            //More testing for future implementation
            //var streamObject = currentVideoObject.streamObject;
            //console.log('StreamObject');
            //console.log(streamObject);

            var sourceBuffers = currentVideoObject.streamObject.sourceBuffers || [],
                activeSourceBuffers = currentVideoObject.streamObject.activeSourceBuffers || [],
                endTimeForVideo = 99999999999;

            //Setting the current video to closed and NaN
            currentVideoObject.readyState = 'closed';
            currentVideoObject.duration = NaN;

            for(var j = 0, activeSourceBuffersLength = activeSourceBuffers.length; j < activeSourceBuffersLength; j++){
                activeSourceBuffers[j].remove(0, endTimeForVideo);
            };

            //Add event to active source buffers
            var removeActiveSourceBuffersEvent = new Event('removesourcebuffer', {"bubbles":false, "cancelable":false});
            activeSourceBuffers.dispatch(removeActiveSourceBuffersEvent);

            for(var i = 0, sourceBuffersLength = sourceBuffers.length; i < sourceBuffersLength; i++){
                //Source buffer
                sourceBuffers[i].remove(0, endTimeForVideo);
            }

            //Add event to sourceBuffers
            var removeSourceBuffersEvent = new Event('removesourcebuffer', {"bubbles":false, "cancelable":false});
            sourceBuffers.dispatch(removeSourceBuffersEvent);

            //Add sourceclose event to MediaSource
            var sourceCloseEvent = new Event('sourceclose', {"bubbles":false, "cancelable":false});
            that._mediaSource.dispatch(sourceCloseEvent);
            //currentVideoObject.streamObject.sourceBuffers = [];

            //Also lets set the key to not keeping appending data here,
            //This is done finally after we done the proper methods and callback according to the MSE object
            _setVideoStreamShouldAppend(false);

        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not abort source buffers, check accessibility';
                messageObject.methodName = 'abortSourceBuffers';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
                messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        //Should we just return that module or the videoStreamingObject
    };

    //  #########################
    //  #### BITRATE METHODS ####
    //  #########################
    /**
     * @function
     * @name _returnBaseUrlBasedOnStoredUserSettings
     * @description Returns the baseUrl that the users stored from the video controls menu
     * @returns {string}
     * @private
     */
    function _returnBaseUrlBasedOnStoredUserSettings(){
        messagesModule.printOutLine('Base URL set by user!');
        var returnBaseUrl = currentVideoObject.streamObject.currentVideoBaseUrl;
        return returnBaseUrl;
    };

    /**
     * @function
     * @name _isBitrateAuto
     * @description Checks if the bitrate is set to auto, this can be used as a flag to determine if the user wants
     * to overwrite the automagic bitrate algorithm
     * @returns {boolean}
     * @private
     */
    function _isBitrateAuto(){
        var bitrateIsAudio = false;
        messagesModule.printOutLine('The currentVideoStreamObject current VideBaseUrl is ..' + currentVideoObject.streamObject.currentVideoBaseUrl);
        if(currentVideoObject.streamObject.currentVideoBaseUrl === 'auto'){
            bitrateIsAudio = true;
        }
        return bitrateIsAudio;
    };

    //  ########################################
    //  #### MEDIA SOURCE EXTENSION METHODS ####
    //  ########################################
    /**
     * @function
     * @name browserSupportsMediaSource
     * @description Checks if the browser supports this media source
     * @returns {boolean}
     */
    function browserSupportsMediaSource(){
      var browserSupportsMediaSourceExtension = false,
          mediaSource = (function(){
              var returnValue = null;
                try {
                    returnValue = new MediaSource();
                } catch(e){
                    // We are now not printin anything,
                    // but the media source is not supported
                    // console.log(e);
                }
                return returnValue;
          })();

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

        //Set current video stream state to true so segments can append
        //when we have created the videoElements and the segment queu being appended.
        _setVideoStreamShouldAppend(true);
        //Lets initiate the media source
        _initiateMediaSource();
        //Lets create the video element and append it to the wrapper
        _createVideoElementAndAppendToWrapper(videoWrapperClassName, optionalConfigurationObject);
        _createMediaSourceStream(currentVideoObject.streamObject.streamBaseUrl, optionalConfigurationObject);
        _addEventListenersToMediaSource();
    };

    /**
     * @function
     * @name _initiateMediaSource
     * @description This method initiates the media source extension and creates a video element aswell.
     * @private
     */
    function _initiateMediaSource(){
        //Add the mediaSource to the class scoped storage
        that._mediaSource = that._mediaSource ? that._mediaSource :  new MediaSource();
    };

    /**
     * @function
     * @name _createMediaSourceStream
     * @description This method creates the media source stream
     * @private
     * @param baseUrl
     */
    function _createMediaSourceStream(baseUrl, optionalConfigurationObject){
        messagesModule.printOutLine('## LOADING VIDEO WITH URL ' + baseUrl);
        //Lets try loading it
        currentVideoObject.streamObject.streamBaseUrl = baseUrl;

        var sourceElement = document.createElement('source');
        sourceElement.src = window.URL.createObjectURL(that._mediaSource);

        that._videoElement.appendChild(sourceElement);

        if(optionalConfigurationObject){
            that._videoElement.poster = optionalConfigurationObject.videoSplashImageUrl ? optionalConfigurationObject.videoSplashImageUrl : settingsObject.videoSplashImageUrl;
        } else {
            that._videoElement.poster = settingsObject.videoSplashImageUrl;
        }
    };

    /**
     * @function
     * @name _createVideoElementAndAppendToWrapper
     * @desription Creates a video elementloadDashMediaWithMediaSourceExtension
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
     * @function
     * @name _createAndReturnSourceBuffer
     * @description A private method adding a source buffer
     * @param streamObject
     * @private
     */
    function _createAndReturnSourceBuffer(streamObject){
        var sourceBuffer = that._mediaSource.addSourceBuffer(streamObject.sourceBufferCodecString);
        //Lets save our sourceBuffer to temporary storage
        currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
        messagesModule.printOutLine('Adding a ' + streamObject.type + ' stream!');
        return sourceBuffer;
    }


    /**
     * @function
     * @name _setDefaultBitrate
     * @description A method that sets the default bitrate, either to index 0 if we do not have multiple qualites, or setting the highest value.
     * @param streamObject
     * @private
     */
    //MAYBE SHOULD SET LOWEST TO START WITH FOR FASTER SEGMENT LOADING AT START..?
    function _setDefaultBitrate(streamObject){
        if(streamObject.baseUrlObjectArray.length > 0){
            //Setting this value so it can be used within the bitrate switch calculations
            var baseUrlObjectsArrayLength = streamObject.baseUrlObjectArray.length,
                baseUrlObjectsArrayHighestIndex = baseUrlObjectsArrayLength - 1;

            messagesModule.printOutLine('The stream we have is..' + streamObject.type);

            currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(streamObject.type + '_baseUrlHighestIndex' , baseUrlObjectsArrayHighestIndex);
        } else {
            currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(streamObject.type + '_baseUrlHighestIndex', 0);
        }
    }

    function _modifyAndStartSourceBuffer(sourceBuffer, streamObject){

                var initializationFile = streamObject.initializationFile,
                    amountOfSegments = streamObject.amountOfSegments,
                    baseUrl = '';

                var bitrateSettingObject = {};
                bitrateSettingObject.baseUrlObjectArray = streamObject.baseUrlObjectArray;
                bitrateSettingObject.typeOfStream = streamObject.type;

                //Lets try updating our videoControls
                _updateVideoControlsWithBitrateSettings(bitrateSettingObject);

                //These two following should probably be rewritten and changed
                sourceBuffer.addEventListener('updatestart', function(){
                    messagesModule.printOutLine('Should start with update... sourceBuffer.updating should be true..' + sourceBuffer.updating);
                    //videoControlsModule.addSpinnerIconToVideoOverlay();
                });

                sourceBuffer.addEventListener('update', function(){
                    messagesModule.printOutLine('Should be done with update... sourceBuffer.updating should be false..' + sourceBuffer.updating);
                    //videoControlsModule.removeSpinnerIconFromVideoOverlay();
                });

                //When we are done updating
                sourceBuffer.addEventListener('updateend', function() {
                    if(that._videoElement.error) {
                        messagesModule.printOutObject(that._videoElement.error);
                    }

                    if( sourceBuffer.buffered.length > 0 ) {
                        messagesModule.printOutLine(mimeType + ' buffer timerange start=' + sourceBuffer.buffered.start(0) + ' / end=' + sourceBuffer.buffered.end(0));
                    }

                    sourceCount++;

                    messagesModule.printOutLine('The stream duration is.. ' + streamDurationInSeconds);
                    messagesModule.printOutLine('The average segment length is ' + averageSegmentDuration);
                    var amountOfSegments = Math.round(streamDurationInSeconds/averageSegmentDuration);

                    messagesModule.printOutLine('The amount of segments should be around.. ' + amountOfSegments);

                    if( streamObject.amountOfSegments > amountOfSegments
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
                        messagesModule.printOutLine('THE BASE URL USER TRY TO SET IS THIS.. ' + baseUrl + ' .. with type ' + typeOfStream);
                    } else {
                        baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);
                        messagesModule.printOutLine('THE BASE URL SET BY THE ALGORITHM IS THIS..' + baseUrl + ' .. with type ' + typeOfStream);
                    }

                    if(videoStreamShouldAppend()){
                        setTimeout(function(){
                            _appendData(sourceBuffer,
                                streamObject.streamBaseUrl +
                                baseUrl +
                                segmentPrefix +
                                sourceCount +
                                segmentEnding,
                                mimeType);
                        }, sourceBufferWaitBeforeNewAppendInMiliseconds);

                        //Here we are checking the buffers
                        _checkBuffers(streamDurationInSeconds);
                    }
                });

                console.log('source buffer ' + index + ' mode: ' + sourceBuffer.mode );
                _appendData(sourceBuffer, currentVideoObject.streamObject.streamBaseUrl + baseUrl + initializationFile, mimeType);

                //Lets push this sourceBuffer to the arrays of source buffers so we can use this
                //with our interval method and set media source duration
                arrayOfSourceBuffers.push(sourceBuffer);

    }


    /**
     * @name _videoReady
     * @description This is the main media method for adpative bitrate content when the video and mediasource object are ready,
     * this is currently used in conjunction with the mpdParserModule and the DASH format for streaming content.
     * @private
     * @param e
     */
     function _videoReady () {

        var periods = mpdParserModule.returnArrayOfPeriodsFromMpdObject(currentVideoObject.streamObject.mpdObject),
            adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromMpdObject(currentVideoObject.streamObject.mpdObject),
            representationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(adaptionSets[0]),
            videoBufferAdded = false,
            audioBufferAdded = false,
            streamBaseUrl = _getStreamBaseUrl(),
            arrayOfSourceBuffers = [];

        var videoObjectMap = streamObjectCreationModule.generateAndReturnVideoObjectMapFromMpdObjectAndStreamBaseUrl(currentVideoObject.streamObject.mpdObject, currentVideoObject.streamObject.streamBaseUrl);

        console.log('The video Object');
        console.log(videoObjectMap);

        //
        //  OK LETS START REWRITING THIS METHOD SO WE USE THE OBJECT WE CREATED INSTEAD
        //
        var videoObjectMapKeys = videoObjectMap.keys();
        console.log(videoObjectMapKeys);

        var streamArray = videoObjectMap.get('streamArray'),
            videoStreamAdded = false,
            audioStreamAdded = false;

        streamArray.forEach(function(stream, streamIndex, currentStreamArray){

            var sourceBuffer = null;

            switch(stream.type){
                case 'video':
                    if(!videoStreamAdded){
                        sourceBuffer = _createAndReturnSourceBuffer(stream);
                        _setDefaultBitrate(stream);
                        videoStreamAdded = true;
                    }
                    break;

                case 'videoAndAudio':
                    if(!videoStreamAdded){
                        sourceBuffer = _createAndReturnSourceBuffer(stream);
                        _setDefaultBitrate(stream);
                        videoStreamAdded = true;
                        audioStreamAdded = true;
                    }
                    break;

                case 'audio':
                    if(!audioStreamAdded){
                        sourceBuffer = _createAndReturnSourceBuffer(stream);
                        _setDefaultBitrate(stream);
                        audioStreamAdded = true;
                    }
                    break;


                case 'subtitles':

                    break;

                default:


            }
        });

        // messagesModule.printOutLine('The adaptionsets are:');
        // messagesModule.printOutObject(adaptionSets);
        //
        // //lets set a start number so we actually do not currently add more than just one video and audio buffer
        // adaptionSets.forEach(function(currentAdaptionSet, index, adaptionSetArray){
        //
        //     var startRepresentationIndex = 0,
        //         adaptionSetMimeType = mpdParserModule.returnMimeTypeFromAdaptionSet(currentAdaptionSet),
        //         arrayOfRepresentationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(currentAdaptionSet),
        //         mimeType = adaptionSetMimeType ? adaptionSetMimeType : mpdParserModule.returnMimeTypeFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
        //         segmentTemplate = mpdParserModule.returnSegmentTemplateFromAdapationSet(currentAdaptionSet),
        //         initializationFile = null,
        //         mediaObject =  mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) ? mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) : null,
        //         streamDurationInSeconds =  mpdParserModule.returnMediaDurationInSecondsFromMpdObject(currentVideoObject.streamObject.mpdObject),
        //         startValue = mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
        //         segmentPrefix = mediaObject ? mediaObject.segmentPrefix : '',
        //         segmentEnding = mediaObject ? mediaObject.segmentEnding : '',
        //         averageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject(currentVideoObject.streamObject.mpdObject),
        //         codecs = '',
        //         baseUrl = '',
        //         baseUrlObjectArray = [],
        //         isVideoStream = false,
        //         isVideoAndAudioStream = false,
        //         isAudioStream = false,
        //         isSubtitleTrack = false,
        //         typeOfStream = 'video',
        //         sourceBuffer = null,
        //         sourceCount = 0,
        //         contentComponentArray = [],
        //         contentComponentArrayLength = 0,
        //         sourceBufferWaitBeforeNewAppendInMiliseconds = 1000;
        //
        //     messagesModule.printOutLine('The mimeType we find is ' + mimeType);
        //     //Lets use the contentComponent to find out if we have a muxxed stream or not
        //
        //     messagesModule.printOutLine('The representation sets are: ');
        //     messagesModule.printOutObject(arrayOfRepresentationSets);
        //
        //     //Lets set the contentComponent length, this will decide if the stream is a muxxed (video and audio) stream
        //     contentComponentArray = mpdParserModule.returnArrayOfContentComponentsFromAdaptionSet(currentAdaptionSet);
        //     contentComponentArrayLength = contentComponentArray.length;
        //
        //     //Lets fix codecs here
        //     codecs = mpdParserModule.returnCodecsFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
        //     //Lets find out the baseUrl here
        //     baseUrl = mpdParserModule.returnBaseUrlFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
        //
        //     //Lets check what type of stream we are loading.
        //     //Video
        //     if(mimeType.indexOf('video') > -1
        //         && contentComponentArrayLength == 0) {
        //         isVideoStream = true;
        //     }
        //
        //     //Video & Audio
        //     if(mimeType.indexOf('video') > -1
        //         && contentComponentArrayLength > 0) {
        //         isVideoAndAudioStream = true;
        //     }
        //
        //     //Audio
        //     if(mimeType.indexOf('audio') > -1){
        //         isAudioStream = true;
        //     }
        //
        //     //Subtitles
        //     if(mimeType.indexOf('vtt') > -1){
        //         isSubtitleTrack = true;
        //     }
        //
        //     //Now lets add sourceBuffers to the streams if we already have not added the video or the audio stream
        //     //Video stream
        //     if(!videoBufferAdded
        //         && isVideoStream
        //         && !isSubtitleTrack){
        //         sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
        //         //Lets save our sourceBuffer to temporary storage
        //         currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
        //         messagesModule.printOutLine('Adding a video stream!');
        //         //Do more stuff here and add markers for the video Stream, where should we save?
        //         videoBufferAdded = true;
        //         typeOfStream = 'video';
        //     }
        //
        //     //Audio stream
        //     if(!audioBufferAdded
        //         && isAudioStream
        //         && !isSubtitleTrack){
        //         sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
        //         //Lets save our sourceBuffer to temporary storage
        //         currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
        //         messagesModule.printOutLine('Adding a audio stream!');
        //         //Do more stuff here and add markers for the audio Stream, where should we save?
        //         audioBufferAdded = true;
        //         typeOfStream = 'audio';
        //     }
        //
        //     //Muxxed stream
        //     if(!videoBufferAdded
        //         && isVideoAndAudioStream
        //         && !isSubtitleTrack){
        //         sourceBuffer = that._mediaSource.addSourceBuffer(mimeType + '; codecs="' + codecs + '"');
        //         //Lets save our sourceBuffer to temporary storage
        //         currentVideoObject.streamObject.sourceBuffers.push(sourceBuffer);
        //         messagesModule.printOutLine('Adding a video and audio stream!');
        //         //Do more stuff here and add markers for the video & audio Stream, where should we save?
        //         videoBufferAdded = true;
        //         audioBufferAdded = true;
        //         typeOfStream = 'videoAndAudio';
        //     }
        //
        //     // If we have multiple representations within the current,
        //     // which means that the stream we have is either video or audio,
        //     // since there is only one representation set if the track is a subtitle track.
        //     if(arrayOfRepresentationSets.length > 0){
        //         baseUrlObjectArray = mpdParserModule.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentationSets);
        //
        //         //Setting this value so it can be used within the bitrate switch calculations
        //         var baseUrlObjectsArrayLength = baseUrlObjectArray.length,
        //             baseUrlObjectsArrayHighestIndex = baseUrlObjectsArrayLength - 1;
        //
        //         messagesModule.printOutLine('The stream we have is..' + typeOfStream);
        //
        //         currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex' , baseUrlObjectsArrayHighestIndex);
        //     } else {
        //         currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlHighestIndex', 0);
        //     }
        //
        //     if(!isSubtitleTrack){
        //
        //         initializationFile = mpdParserModule.returnInitializationFromSegmentTemplate(segmentTemplate);
        //
        //         var bitrateSettingObject = {};
        //         bitrateSettingObject.baseUrlObjectArray = baseUrlObjectArray;
        //         bitrateSettingObject.typeOfStream = typeOfStream;
        //
        //         //Lets try updating our videoControls
        //         _updateVideoControlsWithBitrateSettings(bitrateSettingObject);
        //
        //         //These two following should probably be rewritten and changed
        //         sourceBuffer.addEventListener('updatestart', function(){
        //             messagesModule.printOutLine('Should start with update... sourceBuffer.updating should be true..' + sourceBuffer.updating);
        //             //videoControlsModule.addSpinnerIconToVideoOverlay();
        //         });
        //
        //         sourceBuffer.addEventListener('update', function(){
        //             messagesModule.printOutLine('Should be done with update... sourceBuffer.updating should be false..' + sourceBuffer.updating);
        //             //videoControlsModule.removeSpinnerIconFromVideoOverlay();
        //         });
        //
        //         //When we are done updating
        //         sourceBuffer.addEventListener('updateend', function() {
        //             if(that._videoElement.error)
        //                 messagesModule.printOutObject(that._videoElement.error);
        //             if( sourceBuffer.buffered.length > 0 )
        //                 messagesModule.printOutLine(mimeType + ' buffer timerange start=' + sourceBuffer.buffered.start(0) + ' / end=' + sourceBuffer.buffered.end(0));
        //             sourceCount++;
        //
        //             messagesModule.printOutLine('The stream duration is.. ' + streamDurationInSeconds);
        //             messagesModule.printOutLine('The average segment length is ' + averageSegmentDuration);
        //             var amountOfSegments = Math.round(streamDurationInSeconds/averageSegmentDuration);
        //
        //             messagesModule.printOutLine('The amount of segments should be around.. ' + amountOfSegments);
        //
        //             if( sourceCount > amountOfSegments
        //                 && MediaSource.readyState == 'open') {
        //                 //Lets end stream when we have reached the end of our stream count
        //                 that._mediaSource.endOfStream();
        //                 return;
        //             }
        //
        //             //Lets add the baseUrlObjectArray to the specific sourceBuffer (stream type).
        //             currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectArray);
        //
        //             //Lets switch baseUrl here..
        //             //We first evaulate if we want to bitrate switch from user settings or from adaptive algorithm
        //
        //             //FIX SO THIS ONLY WORKS FOR VIDEO AND NOT AUDIO
        //             if(!_isBitrateAuto()
        //                 && typeOfStream !== 'audio'){
        //                 baseUrl = _returnBaseUrlBasedOnStoredUserSettings();
        //                 messagesModule.printOutLine('THE BASE URL USER TRY TO SET IS THIS.. ' + baseUrl + ' .. with type ' + typeOfStream);
        //             } else {
        //                 baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);
        //                 messagesModule.printOutLine('THE BASE URL SET BY THE ALGORITHM IS THIS..' + baseUrl + ' .. with type ' + typeOfStream);
        //             }
        //
        //             if(videoStreamShouldAppend()){
        //                 setTimeout(function(){
        //                     _appendData(sourceBuffer,
        //                         currentVideoObject.streamObject.streamBaseUrl +
        //                         baseUrl +
        //                         segmentPrefix +
        //                         sourceCount +
        //                         segmentEnding,
        //                         mimeType);
        //                 }, sourceBufferWaitBeforeNewAppendInMiliseconds);
        //
        //                 //Here we are checking the buffers
        //                 _checkBuffers(streamDurationInSeconds);
        //             }
        //         });
        //
        //         console.log('source buffer ' + index + ' mode: ' + sourceBuffer.mode );
        //         _appendData(sourceBuffer, currentVideoObject.streamObject.streamBaseUrl + baseUrl + initializationFile, mimeType);
        //
        //         //Lets push this sourceBuffer to the arrays of source buffers so we can use this
        //         //with our interval method and set media source duration
        //         arrayOfSourceBuffers.push(sourceBuffer);
        //     }
        // });

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
    function _checkBuffers(streamDurationInSeconds) {
        messagesModule.printOutLine('video player buffer: ');
        messagesModule.printOutObject(that._videoElement.buffered);
        messagesModule.printOutLine('video player state: ' + that._videoElement.readyState);
        messagesModule.printOutLine('Buffered length:...' + that._videoElement.buffered.length);

        //Ready States
        //State  Description
        //0      The request is not initialized
        //1      The request has been set up
        //2      The request has been sent
        //3      The request is in process
        //4      The request is complete

        if(that._videoElement.readyState == 4){
            //return;
            messagesModule.printOutLine('Ready state is.. 4.. completed');
        }

        if(that._videoElement.buffered.length > 0){
            //console.log('BVuffered start.. ' + that._videoElement.buffered.start(0));
            //console.log('Buffered end..' +  that._videoElement.buffered.end(0));
            videoControlsModule.updateProgressBarWithBufferedData(
                that._videoElement.buffered.start(0),
                that._videoElement.buffered.end(0),
                streamDurationInSeconds);
        }

        if( 0 == that._videoElement.buffered.length ) {
            //that._videoElement.readyState = that._videoElement.HAVE_METADATA;
            //Do stuff here
            return;
        } else if( that._videoElement.currentTime > that._videoElement.buffered.end(0) - 15 ) {
            //that._videoElement.readyState = that._videoElement.HAVE_FUTURE_DATA;
        }

        switch(that._videoElement.readyState) {
            case that._videoElement.HAVE_NOTHING:
                //console.log('WE HAVE NOTHING YET..');
                break;
            case that._videoElement.HAVE_METADATA:
            case that._videoElement.HAVE_CURRENT_DATA:
            case that._videoElement.HAVE_FUTURE_DATA:

                //console.log('WE HAVE BUFFERED FUTURE DATA! :)');

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
            messagesModule.printOutLine('The number of source buffers are ' + arrayOfSourceBuffers.length);
        }

        //audioBuffer, videoBuffer
        messagesModule.printOutLine('setMediaSource Duration reacehd');
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
        messagesModule.printOutLine('Appending '+type+' data');
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
                messagesModule.printOutWarning("Unexpected status code " + xhr.status + " for " + url);
                return false;
            }
            callback(new Uint8Array(xhr.response));
        };
    };

    /**
     * @name _addEventListenersToMediaSource
     * @description This method adds eventlisteners to the media source object
     * @private
     */
    function _addEventListenersToMediaSource(){
        //  ### EVENT LISTENERS ###
        that._mediaSource.addEventListener('sourceopen', _videoReady, false);
        that._mediaSource.addEventListener('webkitsourceopen', _videoReady, false);
        that._mediaSource.addEventListener('webkitsourceended', function(e) {
            messagesModule.printOutLine('mediaSource readyState: ' + this.readyState);
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
                messageObject.isModule = isModuleValue;
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
     * @function
     * @name _returnClearCurrentVideoStreamObject
     * @description A method to return a resetd currentVideoStreamObject, new parameters, cleared and such
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
            streamBaseUrl:'',
            streamShouldAppend:false
        };
        return returnObject;
    }

    /**
     * @function
     * @name videoStreamShouldAppend
     * @description This method returns the state of the current stream, is the stream active and appending segments or not
     * @returns {boolean}
     * @public
     */
    function videoStreamShouldAppend(){
        return currentVideoObject.streamObject.streamShouldAppend;
    }

    /**
     * @function
     * @name _setVideoStreamShouldAppend
     * @description This method sets the current stream state, when set this can be used to stop segments being added to a appending method for segments
     * @private
     */
    function _setVideoStreamShouldAppend(boolean){
        currentVideoObject.streamObject.streamShouldAppend = boolean;
        return true;
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
    function _updateVideoControlsWithBitrateSettings(bitrateSettingsObject){
        var typeOfStream = bitrateSettingsObject.typeOfStream,
            baseUrlObjectArray = bitrateSettingsObject.baseUrlObjectArray;

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
                messagesModule.printOutLine('Switching to highest bitrate - dl time less than ' + lowestValue);
                var highestIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlHighestIndex');
                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[highestIndex].baseUrl;
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', highestIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= lowestValue
                && timeDifferenceFromLastAppendedSegment < secondLowestValue){
                // We still don't have to low latency in this so lets go up a notch at a time
                // lets take it from here, now we are checking if the latency took
                messagesModule.printOutLine('Switching to higher bitrate - dl time less than 2500, higher than ' + lowestValue);
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
                messagesModule.printOutLine('Staying at this bitrate - dl time more than ' + secondLowestValue + ', less than ' + middleValue);
                var currentIndex = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_currentStreamIndex');

                baseUrl = currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.get(typeOfStream + '_baseUrlObjectArray')[currentIndex].baseUrl;
                currentVideoObject.streamObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_currentStreamIndex', currentIndex);
            }

            if(timeDifferenceFromLastAppendedSegment >= middleValue
                && timeDifferenceFromLastAppendedSegment < highestValue){
                // Lets go down a notch since the dl time was more than 3500 ms
                //  but the dl time was not more than 6000 ms so we should try going down just one notch
                //  Awesomeness lets see how this works
                messagesModule.printOutLine('Switching to lower bitrate - dl time higher than ' +  middleValue + ' but lower than ' + highestValue);
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
                messagesModule.printOutLine('Switching to lowest bitrate - dl time more than ' + highestValue);
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
                messageObject.isModule = isModuleValue;
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

    /**
     * @function
     * @name getVideoElement
     * @description This method returns the videoElement that has been setup by the source media extension and other streaming methods.
     * making it publically accesible to the public API of Free Video Player for instance.
     * @returns {element} - videoElement that is used with streaming technology
     * @public
     */
    function getVideoElement(){
        return that._videoElement;
    };

    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################
    //currentVideoObject methods
    that.addStreamBaseUrl = addStreamBaseUrl;
    that.clearCurrentVideoStreamObject = clearCurrentVideoStreamObject;
    that.videoStreamShouldAppend = videoStreamShouldAppend;
    //that.setCurrentVideoStreamState = setCurrentVideoStreamState;

    //Media Source Extension methods
    that.loadDashMediaWithMediaSourceExtension = loadDashMediaWithMediaSourceExtension;
    that.browserSupportsMediaSource = browserSupportsMediaSource;

    that.abortSourceBuffers = abortSourceBuffers;
    that.clearMediaSource = clearMediaSource;

    //General Methods
    that.getName = getName;
    that.getVersion = getVersion;
    that.isModule = isModule;
    that.getVideoElement = getVideoElement;

    //Lets run this methods on startup
    _initiate();
    _initiateAdaptiveBitrateAlgorithmValue(adaptiveBitrateAlgorithmValue);

    //Lets return our object
    return that;
};
