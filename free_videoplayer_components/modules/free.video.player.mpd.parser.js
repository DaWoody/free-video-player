/**
 * @name FREE VIDEO PLAYER - MPD PARSER MODULE
 * @module FREE VIDEO PLAYER - MPD PARSER MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A  module that handles the parsing and data gathering from mpd manifest files (used for the streaming format DASH) to use with the FREE VIDEO PLAYER library. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param moduleVersion {string} - The messageModule if it got instantited before
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser = function(settingsObject, messagesModule){

    'use strict';

    //  ################################
    //  #### VARIABLE INSTANTIATION ####
    //  ################################
    /**
     * @description Instantiate the variables we need when setting up this mpdParser module
     * @type {{}}
     */
    var currentVideoObject = {},
        that = {},
        moduleVersion = '0.9.0',
        isModuleValue = true,
        moduleName = 'MPD PARSER',
        defaultObject = {
            debugMode:true
        },
        settingsObject = Object.assign({}, defaultObject, settingsObject),
        messagesModule = messagesModule || freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, moduleVersion);


    //  ############################
    //  #### MPD OBJECT METHODS ####
    //  ############################
    /**
     * @description This method returns the asset type, static or dynamic, meaning LIVE or VOD
     * @public
     * @returns {string}
     */
    function returnMediaTypeFromMpdObject(mpdObject){
        var mediaType = 'static';
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {
            if(mpdObject){
                mediaType = mpdObject._type || 'static';
            } else {
                mediaType = currentVideoObject.mpdObject._type || 'static';
            }
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not retrieve media type from the MPD';
                messageObject.methodName = 'returnMediaTypeFromMpdObject';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mediaType;
    };


    /**
     * @description Returns the max segment duration from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number}
     */
    function returnMaxSegmentDurationFromMpdObject(mpdObject){
        var segmentDuration = 0,
            segmentDurationFull = null;
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {

            if(mpdObject){
                segmentDurationFull = mpdObject._maxSegmentDuration || 'M10.000S';
            } else {
                segmentDurationFull = currentVideoObject.mpdObject._maxSegmentDuration || 'M10.000S';
            }
                segmentDuration = segmentDurationFull.split('M')[1],
                segmentDuration = segmentDuration.split('S')[0];

        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not generate a max segment duration string from the MPD';
                messageObject.methodName = 'returnMaxSegmentDurationFromMpdObject';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return segmentDuration;
    };

    /**
     * @description Returns the media duration in seconds from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number}
     */
    function returnMediaDurationInSecondsFromMpdObject(mpdObject){
        var mediaDurationInSeconds = 0,
            mediaDurationFullString = '',
            mediaDurationTemporaryFullString = '';
        try {

            if(mpdObject){
                mediaDurationFullString = mpdObject._mediaPresentationDuration;
            } else {
                mediaDurationFullString = currentVideoObject.mpdObject._mediaPresentationDuration;
            }

            if(mediaDurationFullString.split('T').length > 1){
                console.log('YYT');
                mediaDurationTemporaryFullString = mediaDurationFullString.split('T')[1];
            }

            var hoursString = mediaDurationTemporaryFullString.split('H')[0],
                minutesString = mediaDurationTemporaryFullString.split('H')[1].split('M')[0],
                secondsString = mediaDurationTemporaryFullString.split('M')[1].split('S')[0],
                hours = parseInt(hoursString,10),
                minutes = parseInt(minutesString, 10),
                seconds = parseInt(secondsString, 10),
                hoursInSeconds = hours * 3600,
                minutesInSeconds = minutes * 60;

            ////Lets add our result to the returning mediaDurationInSeconds we
            ////will return
            mediaDurationInSeconds = hoursInSeconds + minutesInSeconds + seconds;

        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not get media duration string from the MPD';
                messageObject.methodName = 'returnMediaDurationInSecondsFromMpdObject';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mediaDurationInSeconds;
    };

    /**
     * @description Returns the average segment duration from the mpd object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number}
     */
    function returnAverageSegmentDurationFromMpdObject(mpdObject){
        var segmentDuration = 0,
            segmentDurationFull = '';
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {

            if(mpdObject){
                segmentDurationFull = mpdObject._maxSegmentDuration || 'M10S';
            } else {
                segmentDurationFull = currentVideoObject.mpdObject._maxSegmentDuration || 'M10S';
            }

            segmentDuration = segmentDurationFull.split('M')[1];
            segmentDuration = segmentDuration.split('S')[0];
            segmentDuration = parseInt(segmentDuration, 10);

        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not generate a max segment duration string from the MPD';
                messageObject.methodName = 'returnAverageSegmentDurationFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        return segmentDuration;
    };

    /**
     * @description Returns an array of adaptionSets from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {Array}
     */
    function returnArrayOfAdaptionSetsFromMpdObject(mpdObject){
        var returnArray = [],
            adaptionSetTemporary = [];

        try {
            mpdObject = mpdObject || currentVideoObject.mpdObject;
            adaptionSetTemporary = mpdObject.Period.AdaptationSet;
            if(Object.prototype.toString.call( adaptionSetTemporary) === '[object Array]' ){
                returnArray = adaptionSetTemporary
            } else {
                returnArray.push(adaptionSetTemporary);
            }

        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse mdpObject.Period.AdapationSet';
                messageObject.methodName = 'returnArrayOfAdaptionSetsFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);

        }
        return returnArray;
    };

    /**
     * @description Returns an array of subtitles from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {Array}
     */
    function returnArrayOfSubtitlesFromMpdObject(mpdObject){
        //Should utilize low level methods to parse through and get the
        //subtitles that we need

        var arrayOfAdaptionSets = returnArrayOfAdaptionSetsFromMpdObject(mpdObject),
            returnArrayOfSubtitles = [],
            firstRepresentation = {},
            mimeType = '',
            subtitleId = 1;

        try {
            arrayOfAdaptionSets.forEach(function(currentAdaptionSet, index, adaptionSetArray){

                var arrayOfRepresentations = returnArrayOfRepresentationSetsFromAdapationSet(currentAdaptionSet);

                firstRepresentation = arrayOfRepresentations[0];
                mimeType = returnMimeTypeFromRepresentation(firstRepresentation);

                if(mimeType.indexOf('vtt') > -1){
                    var subtitleTrackObject = {};
                    //Now its confirmed that the adaptionSet actually contains a webvtt file
                    //Lets build our subtitleTrackObjects
                    subtitleTrackObject.subtitleUrl = returnBaseUrlFromRepresentation(firstRepresentation);
                    subtitleTrackObject.subtitleLanguage = returnSubtitleLanguageFromAdaptionSet(currentAdaptionSet);
                    subtitleTrackObject.subtitleId = subtitleId;
                    //Lets add a tick to our subtitleId counter
                    subtitleId++;
                    returnArrayOfSubtitles.push(subtitleTrackObject);
                }
            });
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not return array of subtitles, check method';
                messageObject.methodName = 'returnArrayOfSubtitlesFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnArrayOfSubtitles;
    };

    //  #############################
    //  #### ADAPTIONSET METHODS ####
    //  #############################
    /**
     * @description Returns the segment template from the adaptionset
     * @public
     * @param AdapationSet
     * @returns {{}}
     */
    function returnSegmentTemplateFromAdapationSet(AdapationSet){
        var segmentTemplate = {};
        try {
            segmentTemplate = AdapationSet.SegmentTemplate;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse SegmentTemplate from AdapationSet';
                messageObject.methodName = 'returnSegmentTemplateFromAdapationSet';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return segmentTemplate;
    };

    /**
     * @description Returns the mimeType from the adaptionSet
     * @public
     * @param AdaptationSet
     * @returns {*}
     */
    function returnMimeTypeFromAdaptionSet(AdaptationSet){
        var mimeType = null;
        try {
            mimeType = (AdaptationSet._mimeType) ? AdaptationSet._mimeType : null;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not return MimeType from AdaptionSet';
                messageObject.methodName = 'returnMimeTypeFromAdaptionSet';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mimeType;
    };

    /**
     * @description Returns subtitle language from adaptionSet
     * @public
     * @param AdaptionSet
     * @returns {string}
     */
    function returnSubtitleLanguageFromAdaptionSet(AdaptionSet){
        var subtitleLanguage = '';
        try {
            subtitleLanguage = AdaptionSet._lang;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse Subtitle track url from AdapationSet';
                messageObject.methodName = 'returnSubtitleUrlFromAdapationSet';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return subtitleLanguage;
    };

    /**
     * @description Return array of representations from AdaptionSet
     * @public
     * @param AdaptionSet
     * @returns {Array}
     */
    function returnArrayOfRepresentationSetsFromAdapationSet(AdaptionSet){
        var returnArray = [],
            arrayOfRepresentation = [];
        try {
            arrayOfRepresentation = AdaptionSet.Representation;
            if(Object.prototype.toString.call(arrayOfRepresentation) === '[object Array]'){
                //We have an array of representations and
                returnArray = arrayOfRepresentation;
            } else {
                //Its an object and then lets just push the object to
                //the empty array and return that array
                returnArray.push(arrayOfRepresentation);
            }
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse and return an array of Representation from AdapationSet, check input';
                messageObject.methodName = 'returnArrayOfRepresentationFromAdapationSet';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnArray;
    };

    function returnArrayOfContentComponentsFromAdaptionSet(AdaptionSet){
        var returnArray = [],
            arrayOfContentComponents = [];
        try {
            arrayOfContentComponents = AdaptionSet.ContentComponent;
            if(Object.prototype.toString.call(arrayOfContentComponents) === '[object Array]'){
                //We have an array of contentComponents
                returnArray = arrayOfContentComponents;
            }
            // else {
            //    //Its an object and then lets just push the object to
            //    //the empty array and return that array
            //    returnArray.push(arrayOfRepresentation);
            //}
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse and return an array of ContentComponents from AdapationSet, check input';
                messageObject.methodName = 'returnArrayOfContentComponentsFromAdaptionSet';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnArray;
    };

    //  ################################
    //  #### REPRESENTATION METHODS ####
    //  ################################
    function returnBaseUrlFromRepresentation(Representation){
        var baseUrl = '';
        try {
            baseUrl = Representation.BaseURL;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse BaseURL from Representation';
                messageObject.methodName = 'returnBaseUrlFromRepresentation';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return baseUrl;
    };

    function returnMimeTypeFromRepresentation(Representation){
        var mimeType = '';
        try {
            mimeType = Representation._mimeType;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not return MimeType from Representation';
                messageObject.methodName = 'returnMimeTypeFromRepresentation';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mimeType;
    };

    function returnCodecsFromRepresentation(Representation){
        var codecs = '';
        try {
            codecs = Representation._codecs;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not return Codecs from Representation';
                messageObject.methodName = 'returnCodecsFromRepresentation';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return codecs;
    };

    function returnStartNumberFromRepresentation(Representation){
        var startNumber = 0;
        try {
            startNumber = Representation._startWithSAP;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse mpdObject and retrieve Representation._startWithSAP';
                messageObject.methodName = 'returnStartNumberFromRepresentation';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return startNumber;
    };

    function returnArrayOfBaseUrlObjectsFromArrayOfRepresentations(arrayOfRepresentations){
        var arrayOfBaseUrlObjects = [];
        try {
            for(var i = 0, arrayOfRepresentationsLength = arrayOfRepresentations.length; i < arrayOfRepresentationsLength; i++){
                var currentBaseUrlObject = {};
                currentBaseUrlObject.bandwidth = arrayOfRepresentations[i]._bandwidth;
                currentBaseUrlObject.mimeType = arrayOfRepresentations[i]._mimeType;
                currentBaseUrlObject.codecs = arrayOfRepresentations[i]._codecs;
                currentBaseUrlObject.baseUrl = arrayOfRepresentations[i].BaseURL;
                currentBaseUrlObject.width = arrayOfRepresentations[i]._width || '';
                currentBaseUrlObject.height = arrayOfRepresentations[i]._height || '';
                currentBaseUrlObject.type = returnTypeFromMimeTypeAndCodecString(arrayOfRepresentations[i]._mimeType, arrayOfRepresentations[i]._codecs);
                currentBaseUrlObject.index = i;
                arrayOfBaseUrlObjects.push(currentBaseUrlObject);
            }
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse and extract the array of base urls from the array of representations, checkt input';
                messageObject.methodName = 'returnArrayOfBaseUrlsFromArrayOfRepresentations';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return arrayOfBaseUrlObjects;
    }


    //  ##################################
    //  #### SEGMENT TEMPLATE METHODS ####
    //  ##################################
    function returnDurationFromSegmentTemplate(SegmentTemplate) {
        var duration = 0;
        try {
            duration = SegmentTemplate._duration;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse Duration from SegmentTemplate';
                messageObject.methodName = 'returnDurationFromSegmentTemplate';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return duration;
    };

    function returnInitializationFromSegmentTemplate(SegmentTemplate){
        var initializationFile = '';
        try {
            initializationFile = SegmentTemplate._initialization;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse initializationFile from SegmentTemplate';
                messageObject.methodName = 'returnInitializationFromSegmentTemplate';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return initializationFile;
    };

    function returnMediaStructureAsObjectFromSegmentTemplate(SegmentTemplate){
        var returnObject = {};
        try {
            var mediaStructure = SegmentTemplate._media,
                mediaStructure = mediaStructure.split('$Number$');

            returnObject.segmentPrefix = mediaStructure[0];
            returnObject.segmentEnding = mediaStructure[1];
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not return media structure from SegmentTemplate';
                messageObject.methodName = 'returnMediaStructureAsObjectFromSegmentTemplate';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnObject;
    };

    //  #########################
    //  #### GENERAL METHODS ####
    //  #########################


    /**
     * @description This method makes the XMLHttp request and fetches the actual mpd manifest file
     * @private
     * @param url
     * @param callback
     */
    function getMpd(url, callback) {
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



    function returnTypeFromMimeTypeAndCodecString(mimeType, codecString){
        var returnType = 'audio',
            tempCodecArray = [],
            tempMimeTypeArray = [];
            try {

                tempCodecArray = codecString.split(',');
                tempMimeTypeArray = mimeType.split('video');

                if(tempCodecArray.length > 1){
                    //We have two codecs, should indicate that the stream is muxxed, this should indicate that
                    //the stream we are returning should include both an audio and video part
                    returnType = 'video';
                }

                if(tempMimeTypeArray.length > 1){
                    //The other option is that the stream we are testing is a video stream but separated
                    //Then this condition should take care of this.
                    returnType = 'video';
                }

            } catch (e){
                var messageObject = {};
                    messageObject.message = 'Could not parse and return type (video or audio) from mimeType, check input';
                    messageObject.methodName = 'returnTypeFromMimeType';
                    messageObject.moduleName = moduleName;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
            }
        return returnType;
    };


    function setMpdObject(mpdObject){
        currentVideoObject.mpdObject = mpdObject;
    };

    function getMpdObject(){
        return currentVideoObject.mpdObject;
    };

    function returnStreamBaseUrlFromMpdUrl(mpdUrl){
        var returnBaseUrl = '',
            temporaryUrl = '',
            mpdName = '';
        try {
            mpdName = mpdUrl.split('/');
            mpdName = mpdName.pop();

            temporaryUrl = mpdUrl.split(mpdName)[0];
            returnBaseUrl = temporaryUrl;
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not generate the streamBaseUrl from the mpdUrl';
                messageObject.methodName = 'returnStreamBaseUrlFromMpdUrl';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnBaseUrl;
    };

    function checkIfMultipleAdaptionSets(){
        var multipleAdaptionSetsBoolean = false,
            adaptionSets = {};
        try {
            //Lets add logic here to see if we have multiple adaptionSets.. needed?
            //Do we need this method?

        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not check if stream has multiple adaptionSets';
                messageObject.methodName = 'checkIfMultipleAdaptionSets';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return multipleAdaptionSetsBoolean;
    };

    function checkIfAdapationSetContainSingleRepresentation(AdaptionSet){
        var returnBoolean = true,
            representationAsArray = [];
        try {
            representationAsArray = AdaptionSet.Representation;
            if(Object.prototype.toString.call(representationAsArray) === '[object Array]'){
                returnBoolean = false;
            }
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not parse through the AdaptionSet';
                messageObject.methodName = 'checkIfAdapationSetContainSingleRepresentation';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);

        }
        return returnBoolean;
    };

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
    //General
    that.getMpd = getMpd;
    that.getMpdObject = getMpdObject;
    that.setMpdObject = setMpdObject;
    that.getVersion = getVersion;
    that.getName = getName;
    that.isModule = isModule;

    that.checkIfAdapationSetContainSingleRepresentation = checkIfAdapationSetContainSingleRepresentation;
    that.returnStreamBaseUrlFromMpdUrl = returnStreamBaseUrlFromMpdUrl;
    that.returnTypeFromMimeTypeAndCodecString = returnTypeFromMimeTypeAndCodecString;

    //AdapationSet methods
    that.returnMimeTypeFromAdaptionSet = returnMimeTypeFromAdaptionSet;
    that.returnSegmentTemplateFromAdapationSet = returnSegmentTemplateFromAdapationSet;
    that.returnArrayOfRepresentationSetsFromAdapationSet = returnArrayOfRepresentationSetsFromAdapationSet;
    that.returnSubtitleLanguageFromAdaptionSet = returnSubtitleLanguageFromAdaptionSet;
    that.returnArrayOfContentComponentsFromAdaptionSet = returnArrayOfContentComponentsFromAdaptionSet;

    //MpdObject methods
    that.returnMediaTypeFromMpdObject = returnMediaTypeFromMpdObject;
    that.returnMaxSegmentDurationFromMpdObject = returnMaxSegmentDurationFromMpdObject;
    that.returnAverageSegmentDurationFromMpdObject = returnAverageSegmentDurationFromMpdObject;
    that.returnMediaDurationInSecondsFromMpdObject = returnMediaDurationInSecondsFromMpdObject;
    that.returnArrayOfAdaptionSetsFromMpdObject = returnArrayOfAdaptionSetsFromMpdObject;
    that.returnArrayOfSubtitlesFromMpdObject = returnArrayOfSubtitlesFromMpdObject;

    //SegmentTemplate methods
    that.returnDurationFromSegmentTemplate = returnDurationFromSegmentTemplate;
    that.returnInitializationFromSegmentTemplate = returnInitializationFromSegmentTemplate;
    that.returnMediaStructureAsObjectFromSegmentTemplate = returnMediaStructureAsObjectFromSegmentTemplate;

    //Representation methods
    that.returnBaseUrlFromRepresentation = returnBaseUrlFromRepresentation;
    that.returnCodecsFromRepresentation = returnCodecsFromRepresentation;
    that.returnStartNumberFromRepresentation = returnStartNumberFromRepresentation;
    that.returnMimeTypeFromRepresentation = returnMimeTypeFromRepresentation;
    that.returnArrayOfBaseUrlObjectsFromArrayOfRepresentations = returnArrayOfBaseUrlObjectsFromArrayOfRepresentations;


    //Lets return our object
    return that;
};