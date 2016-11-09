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

    /**
     * @function
     * @name _returnStreamTypeBasedOnMimeTypeAndContentComponentArrayLength
     * @description Returns Stream type based on mimeType and ContentComponentArray Length
     * @param mimeType
     * @param contentComponentArrayLength
     * @returns {string}
     * @private
     */
    function _returnStreamTypeBasedOnMimeTypeAndContentComponentArrayLength(mimeType, contentComponentArrayLength){
        var returnValue = 'video';

        //Lets check what type of stream we are loading.
        //Video
        if(mimeType.indexOf('video') > -1
            && contentComponentArrayLength == 0) {
               returnValue = 'video';
        }
        //Video & Audio
        if(mimeType.indexOf('video') > -1
            && contentComponentArrayLength > 0) {
            returnValue = 'videoAndAudio';
        }
        //Audio
        if(mimeType.indexOf('audio') > -1){
            returnValue = 'audio';
        }
        //Subtitles
        if(mimeType.indexOf('vtt') > -1){
            returnValue = 'subtitles';
        }
        return returnValue;
    }

    /**
     * @function
     * @name generateAndReturnVideoObjectMapFromMpdObjectAndStreamBaseUrl
     * @description Generates and returns a video Object Map from mpd and streambase url
     * @param mpdObject
     * @param currentVideoStreamBaseUrl
     * @returns {Map}
     */
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

            returnVideoMapObject.set('mediaType', mediaTypeLiveOrStatic);
            returnVideoMapObject.set('mediaFormat', 'dash');
            returnVideoMapObject.set('amountOfPeriods', periods.length);
            returnVideoMapObject.set('maxSegmentDuration', periodsMaxSegmentDuration);
            returnVideoMapObject.set('averageSegmentDuration', periodsAverageSegmentDuration);
            returnVideoMapObject.set('mediaDurationInSeconds', mediaDurationInSeconds);
            returnVideoMapObject.set('amountOfSegments', amountOfSegments);
            returnVideoMapObject.set('streamBaseUrl', streamBaseUrl);

            var streamArray = [],
                subtitlesObject = {};

            periods.forEach(function(periodObject, periodIndex, periodArray){

                var periodIndexString = 'periodIndex' + periodIndex;
                subtitlesObject[periodIndexString] =  [];

                var adaptionSets = mpdParserModule.returnArrayOfAdaptionSetsFromPeriodObject(periodObject);

                adaptionSets.forEach(function(currentAdaptionSet, adaptionSetIndex){

                    var startRepresentationIndex = 0,
                        adaptionSetMimeType = mpdParserModule.returnMimeTypeFromAdaptionSet(currentAdaptionSet),
                        arrayOfRepresentationSets = mpdParserModule.returnArrayOfRepresentationSetsFromAdapationSet(currentAdaptionSet),
                        mimeType = adaptionSetMimeType ? adaptionSetMimeType : mpdParserModule.returnMimeTypeFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]),
                        segmentTemplate = mpdParserModule.returnSegmentTemplateFromAdapationSet(currentAdaptionSet),
                        mediaObject =  mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) ? mpdParserModule.returnMediaStructureAsObjectFromSegmentTemplate(segmentTemplate) : null,
                        initializationFile =  mpdParserModule.returnInitializationFromSegmentTemplate(segmentTemplate) ?  mpdParserModule.returnInitializationFromSegmentTemplate(segmentTemplate) : null,
                        baseUrlObjectArray = mpdParserModule.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentationSets) ? mpdParserModule.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentationSets) : [],
                        startValue = mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]) ? parseInt(mpdParserModule.returnStartNumberFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]), 10) : 0,
                        segmentPrefix = mediaObject ? mediaObject.segmentPrefix : '',
                        segmentEnding = mediaObject ? mediaObject.segmentEnding : '',
                        mediaDurationInSecondsPeriod = mpdParserModule.returnMediaDurationInSecondsFromPeriodObject(periodObject),
                        averageSegmentDuration = returnVideoMapObject.get('averageSegmentDuration'),
                        codecs = '',
                        baseUrl = '',
                        baseUrlArray = [],
                        typeOfStream = 'video',
                        sourceBuffer = null,
                        sourceCount = 0,
                        contentComponentArray = [],
                        contentComponentArrayLength = 0,
                        representationSetArray = [],
                        representationSetArrayLength = 0,
                        sourceBufferWaitBeforeNewAppendInMiliseconds = 1000;

                    //Lets set the contentComponent length, this will decide if the stream is a muxxed (video and audio) stream
                    contentComponentArray = mpdParserModule.returnArrayOfContentComponentsFromAdaptionSet(currentAdaptionSet);
                    contentComponentArrayLength = contentComponentArray.length;

                    //Lets fix codecs here
                    codecs = mpdParserModule.returnCodecsFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);
                    //Lets find out the baseUrl here
                    baseUrl = mpdParserModule.returnBaseUrlFromRepresentation(arrayOfRepresentationSets[startRepresentationIndex]);

                    var baseUrlPush = '',
                        baseUrlObjectArray = mpdParserModule.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentationSets);

                    //Lets see how many representationSets we do have within the adaptionSet
                    arrayOfRepresentationSets.forEach(function(representationSet, representationSetIndex){
                        baseUrlPush = representationSet['BaseURL'] ? representationSet['BaseURL'] : baseUrl;
                        baseUrlArray.push(baseUrlPush);
                    });

                    //Generate a stream object for the actual stream
                    var streamObject = {},
                        codecString = mimeType + '; codecs="' + codecs + '"',
                        //Calculate the amount of segments for this peticular period
                        amountOfSegments = Math.round(mediaDurationInSecondsPeriod/returnVideoMapObject.get('averageSegmentDuration'));

                    streamObject.type = _returnStreamTypeBasedOnMimeTypeAndContentComponentArrayLength(mimeType, contentComponentArrayLength);


                    //Lets add the rest of the object values
                    streamObject.amountOfPeriods = returnVideoMapObject.get('amountOfPeriods');
                    streamObject.mimeType = mimeType;
                    streamObject.initializationFile = initializationFile;
                    streamObject.baseUrlArray = baseUrlArray;
                    streamObject.baseUrlObjectArray = baseUrlObjectArray;
                    streamObject.codec = codecs;
                    streamObject.sourceBufferCodecString = codecString;
                    streamObject.amountOfSegments = amountOfSegments,
                    streamObject.averageSegmentDuration = returnVideoMapObject.get('averageSegmentDuration'),
                    streamObject.mediaDurationInSeconds = mediaDurationInSecondsPeriod,
                    streamObject.sourceBufferWaitBeforeNewAppendInMiliseconds = sourceBufferWaitBeforeNewAppendInMiliseconds;
                    streamObject.content = [];

                    //Counting on the idea that each adaptionSet containing subtitles,
                    //only have one representationSet including one subtitle link
                    if(streamObject.type == 'subtitles'){
                        //Lets do stuff here if we have subtitles
                        var subtitleObject = {
                            subtitleUrl: baseUrlPush
                        };
                        subtitlesObject[periodIndexString].push(subtitleObject);
                    }

                    var amountOfSegmentsAddedWithStartValue = parseInt(amountOfSegments, 10) + startValue;


                    for(var segmentIndex = startValue; segmentIndex < amountOfSegmentsAddedWithStartValue; segmentIndex++){
                        //Lets create the url string based on the resource is a vtt file or not,
                        //if the current segment is a vtt segment, the full url will be displayed within
                        //the baseUrl field, and thus we will not need to build up a full url before saving
                        //it to our returnVideoObjectMap

                        console.log('endCount ' + amountOfSegmentsAddedWithStartValue);
                        console.log('StartValue ' + startValue);
                        console.log('SegmentIndex ' + segmentIndex);

                        var contentObject = {};

                        if(streamObject['type'] !== 'subtitles'){
                            //Its an audio or video segment, lets build the full url
                            contentObject.subtitles = [];
                            contentObject.periodIndex = periodIndex;
                            contentObject.periodIsAd = false;
                            contentObject.streamBaseUrl = returnVideoMapObject.get('streamBaseUrl');
                            contentObject.segmentPrefix = segmentPrefix;
                            contentObject.segmentIndex = segmentIndex;
                            contentObject.segmentEnding = segmentEnding;
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
                                streamArray[j].content.push(contentObject);
                            }
                        }
                        //If we have not already added the content to an exisiting streamtype, we should add a new one
                        if(!streamTypeExists && streamObject.type !== 'subtitles'){
                            streamObject.content.push(contentObject);
                            //Push the streamObject to the streamArray
                            streamArray.push(streamObject);
                        }
                    }
                     // console.log('Stream Array');
                     // console.log(streamArray);
                });

                //CREATE MORE LOGIC HERE SO WE CAN KEEP ADDING MORE STUFF TO THE STREAM
                //HAVE MULTIPLE STREAMS AND SUCH :)
            });

                //lets iterate through our streamArray and add the subtitles to the video and videoAndAudio objects
                streamArray.forEach(function(streamObject, streamArrayIndex){
                    if(streamObject.type === 'video' || streamObject.type === 'videoAndAudio'){
                        streamObject.subtitles = subtitlesObject;
                    }
                });

            returnVideoMapObject.set('streamArray', streamArray);
        } else {
            console.log('Could not generate VideoObjectMap from mpdObject since we are missing the mpdParser module, or we do not have a valid streamBaseUrl');
        }

        //return our video object
        return returnVideoMapObject;
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