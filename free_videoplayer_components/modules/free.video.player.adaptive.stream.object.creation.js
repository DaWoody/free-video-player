/**
 * @name FREE VIDEO PLAYER - ADAPTIVE STREAMING MODULE - OBJECT CREATION
 * @module FREE VIDEO PLAYER - ADAPTIVE STREAMING MODULE - OBJECT CREATION
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A  module that handles the creation of the video object used within the streaming module used with the Media Source Extension and playing streaming formats, to use with the FREE VIDEO PLAYER library. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param moduleVersion {string} - The videoControlsModule that the Free Video Player uses
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerAdaptiveStreamObjectCreation = function(){

    //return object
    var that = {},
        isModuleValue = true,
        moduleName = 'ADAPTIVE STREAMING OBJECT CREATION',
        moduleVersion = '0.9.8',
        mpdParserModule = null,
        hlsParserModule = null,
        streamBaseUrl = '';

    function generateAndReturnVideoObjectMapFromMpdObjectAndStreamBaseUrl(mpdObject, currentVideoStreamBaseUrl){

        if(mpdParserModule){
            var returnVideoMapObject = new Map(),
                periods = mpdParserModule.returnArrayOfPeriodsFromMpdObject(mpdObject),
                periodsMaxSegmentDuration = mpdParserModule.returnMaxSegmentDurationFromMpdObject(mpdObject),
                periodsAverageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject(mpdObject),
                mediaDurationInSeconds = mpdParserModule.returnMediaDurationInSecondsFromMpdObject(mpdObject),
                mediaTypeLiveOrStatic = mpdParserModule.returnMediaTypeFromMpdObject(mpdObject),
                streamBaseUrl = currentVideoStreamBaseUrl,
                amountOfSegments = Math.round(mediaDurationInSeconds/periodsAverageSegmentDuration);

            returnVideoMapObject.set('mediaTypeIs', mediaTypeLiveOrStatic);
            returnVideoMapObject.set('amountOfPeriods', periods.length);
            returnVideoMapObject.set('maxSegmentDuration', periodsMaxSegmentDuration);
            returnVideoMapObject.set('averageSegmentDuration', periodsAverageSegmentDuration);
            returnVideoMapObject.set('mediaDurationInSeconds', mediaDurationInSeconds);
            returnVideoMapObject.set('amountOfSegments', amountOfSegments);
            returnVideoMapObject.set('streamBaseUrl', streamBaseUrl);

            var streamArray = [],
                videoMapIterator = returnVideoMapObject.keys();

            periods.forEach(function(periodObject, periodIndex, array){

                var adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromPeriodObject(periodObject),
                    periodHasSubtitles = false;

                adaptionSets.forEach(function(currentAdaptionSet, adaptionSetIndex){

                    var startRepresentationIndex = 0,
                        adaptionSetMimeType = mpdParserModule.returnMimeTypeFromAdaptionSet(currentAdaptionSet),
                        arrayOfRepresentationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(currentAdaptionSet),
                        mimeType = adaptionSetMimeType ? adaptionSetMimeType : mpdParserModule.returnMimeTypeFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                        segmentTemplate = mpdParserModule.returnSegmentTemplateFromAdapationSet(currentAdaptionSet),
                        initializationFile = null,
                        mediaObject =  mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) ? mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) : null,
                        startValue = mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                        segmentPrefix = mediaObject ? mediaObject.segmentPrefix : '',
                        segmentEnding = mediaObject ? mediaObject.segmentEnding : '',
                        mediaDurationInSeconds = returnVideoMapObject.get('mediaDurationInSeconds'),
                        averageSegmentDuration = returnVideoMapObject.get('averageSegmentDuration'),
                        codecs = '',
                        baseUrl = '',
                        baseUrlObjectArray = [],
                        typeOfStream = 'video',
                        sourceBuffer = null,
                        sourceCount = 0,
                        contentComponentArray = [],
                        contentComponentArrayLength = 0,
                        sourceBufferWaitBeforeNewAppendInMiliseconds = 1000;

                    //Lets set the contentComponent length, this will decide if the stream is a muxxed (video and audio) stream
                    contentComponentArray = mpdParserModule.returnArrayOfContentComponentsFromAdaptionSet(currentAdaptionSet);
                    contentComponentArrayLength = contentComponentArray.length;

                    //Lets fix codecs here
                    codecs = mpdParserModule.returnCodecsFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
                    //Lets find out the baseUrl here
                    baseUrl = mpdParserModule.returnBaseUrlFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);

                    //Generate a stream object for the actual stream
                    var streamObject = {},
                        codecString = mimeType + '; codecs="' + codecs + '"';

                    //Lets check what type of stream we are loading.
                    //Video
                    if(mimeType.indexOf('video') > -1
                        && contentComponentArrayLength == 0) {
                        streamObject = {
                            type:'video',
                            mimeType: mimeType,
                            codec: codecs,
                            sourceBufferCodecString: codecString,
                            sourceBufferWaitBeforeNewAppendInMiliseconds: sourceBufferWaitBeforeNewAppendInMiliseconds,
                            content:[]
                        }
                    }

                    //Video & Audio
                    if(mimeType.indexOf('video') > -1
                        && contentComponentArrayLength > 0) {
                        streamObject = {
                            type:'videoAndAudio',
                            mimeType: mimeType,
                            codec: codecs,
                            sourceBufferCodecString: codecString,
                            sourceBufferWaitBeforeNewAppendInMiliseconds: sourceBufferWaitBeforeNewAppendInMiliseconds,
                            content:[]
                        }
                    }

                    //Audio
                    if(mimeType.indexOf('audio') > -1){
                        streamObject = {
                            type:'audio',
                            mimeType: mimeType,
                            codec: codecs,
                            sourceBufferCodecString: codecString,
                            sourceBufferWaitBeforeNewAppendInMiliseconds: sourceBufferWaitBeforeNewAppendInMiliseconds,
                            content:[]
                        }
                    }

                    //Subtitles
                    if(mimeType.indexOf('vtt') > -1){
                        periodHasSubtitles = true;
                        streamObject = {
                            type:'subtitles',
                            mimeType: mimeType,
                            codec: codecs,
                            sourceBufferCodecString: codecString,
                            sourceBufferWaitBeforeNewAppendInMiliseconds: sourceBufferWaitBeforeNewAppendInMiliseconds,
                            content:[]
                        }
                    }

                    for(var segmentIndex = 0; segmentIndex < amountOfSegments; segmentIndex++){

                        //Lets create the url string based on the resource is a vtt file or not,
                        //if the current segment is a vtt segment, the full url will be displayed within
                        //the baseUrl field, and thus we will not need to build up a full url before saving
                        //it to our returnVideoObjectMap
                        var contentObject = {
                            urlString: '',
                            periodIndex: periodIndex,
                            periodHasSubtitles: periodHasSubtitles,
                            periodIsAd:false, //Fix so we know if the actual period is an add or not
                            averageSegmentDurationInSeconds: returnVideoMapObject.get('averageSegmentDuration')
                        };

                        if(streamObject['type'] === 'subtitles'){
                            //If we have a subtitle segment, we should just save it as the baseUrl
                            contentObject.urlString = baseUrl;
                        } else {
                            //Its an audio or video segment, lets build the full url
                            contentObject.urlString = returnVideoMapObject.get('streamBaseUrl') +
                                baseUrl +
                                segmentPrefix +
                                segmentIndex +
                                segmentEnding;
                        }
                        //lets create the url and push it to the current content array
                        var streamTypeExists = false,
                            subtitleUrlExists = false;

                        //Lets see if we already have a saved array with this specific content
                        for(var j=0, streamArrayLength = streamArray.length; j < streamArrayLength; j++){
                            //Lets see if we already have the stream type saved, if that is the case we should just keep iterating
                            //and pushing to the array of possible segments. Currently one period is stacked ontop of the next period
                            //so the first period will play, then the second, then the third etc..

                            if(streamArray[j]['type'] === streamObject['type']){
                                //The type has already been added
                                streamTypeExists = true;
                                subtitleUrlExists = false;
                                //lets check to see if the object type is vtt,
                                // if that is the case we should not add doubles
                                if(streamArray[j]['type'] === 'subtitles'){
                                    //Lets check and see if the url is the same as before
                                    for(var k = 0, subtitlesArrayLength = streamArray[j].content.length; k < subtitlesArrayLength; k++){
                                        subtitleUrlExists = streamArray[j].content[k] === contentObject.urlString ? true : false;
                                    }
                                }
                                //Lets add the url string to the already added stream type
                                if(!subtitleUrlExists){
                                    streamArray[j].content.push(contentObject);
                                }
                            }
                        }
                        //If we have not already added the content to an exisiting streamtype, we should add a new one
                        if(!streamTypeExists){
                            streamObject.content.push(contentObject);
                            //Push the streamObject to the streamArray
                            streamArray.push(streamObject);
                        }
                    }
                    console.log('Stream Array');
                    console.log(streamArray);
                });

                //CREATE MORE LOGIC HERE SO WE CAN KEEP ADDING MORE STUFF TO THE STREAM
                //HAVE MULTIPLE STREAMS AND SUCH :)
            });

            returnVideoMapObject.set('streamArray', streamArray);
            // console.log('Showing array..');
            // console.log(returnVideoMapObject.get('streamArray'));
        } else {
            console.log('Could not generate VideoObjectMap from mpdObject since we are missing the mpdParser module, or we do not have a valid streamBaseUrl');
        }
    };

    //  #########################
    //  #### PARSER METHODS ####
    //  #########################
    function addMpdParserModule(module){
        try {
            mpdParserModule = module;
        }catch(e){
            console.log('Could not add the mpdParserModule')
        }
    };

    function addHlsParserModule(module){
        try {
            hlsParserModule = module;
        }catch(e){
            console.log('Could not add the hlsParserModule')
        }
    };

    function addStreamBaseUrl(url){
        try {
            streamBaseUrl = url;
        }catch(e){
            console.log('Could not add the streamBaseUrl')
        }
    };

    function hlsParserModuleExists(){
        return hlsParserModule ? true : false;
    }

    function mpdParserModuleExists(){
        return mpdParserModule ? true : false;
    }

    function streamBaseUrlExists(){
        return streamBaseUrl === '' ? false : true;
    }

    function returnMpdParserModule(){
        return mpdParserModule;
    }


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

    //Public methods

    //General Methods
    that.getName = getName;
    that.getVersion = getVersion;
    that.isModule = isModule;

    //Parser Module
    that.hlsParserModuleExists = hlsParserModuleExists;
    that.mpdParserModuleExists = mpdParserModuleExists;
    that.streamBaseUrlExists = streamBaseUrlExists;

    that.returnMpdParserModule = returnMpdParserModule;

    that.addMpdParserModule = addMpdParserModule;
    that.addHlsParserModule = addHlsParserModule;
    that.addStreamBaseUrl = addStreamBaseUrl;
    that.generateAndReturnVideoObjectMapFromMpdObjectAndStreamBaseUrl = generateAndReturnVideoObjectMapFromMpdObjectAndStreamBaseUrl;

    //Return our class
    return that;
};