/**
 * @name FREE VIDEO PLAYER - MPD PARSER MODULE
 * @module FREE VIDEO PLAYER - MPD PARSER MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A  module that handles the parsing and data gathering from mpd manifest files (used for the streaming format DASH) to use with the FREE VIDEO PLAYER library. Most of the modules methods are public, and its meant to be a help tool for other modules when working with the DASH format and reading the manifest (or mpd) file.Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
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
     * @function
     * @name returnMediaTypeFromMpdObject
     * @description This method returns the asset type, static or dynamic, meaning LIVE or VOD
     * @public
     * @returns {string} - The media type as a string, could be dynamic (for LIVE) or static (for VOD)
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
     * @function
     * @name returnMaxSegmentDurationFromMpdObject
     * @description Returns the max segment duration from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number} - Returns the segment duration, usually measured in seconds, so if a segment is more than 60 seconds this method will probably error out
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
     * @function
     * @name returnMediaDurationInSecondsFromMpdObject
     * @description Returns the media duration in seconds from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number} - The media duration in seconds
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
     * @function
     * @name returnAverageSegmentDurationFromMpdObject
     * @description Returns the average segment duration from the mpd object, measured in seconds
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {number} - The average segment duration, measured in seconds
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
     * @function
     * @name returnArrayOfAdaptionSetsFromMpdObject
     * @description Returns an array of adaptionSets from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {Array} - And array of adaptionsets from the MPD object
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
     * @function
     * @name returnArrayOfSubtitlesFromMpdObject
     * @description Returns an array of subtitles from the MPD object
     * @public
     * @param {object} mpdObject - Optional, this can be sent in or the stored mpdObject can be used.
     * @returns {Array} - An array of subtitle objects packed into an array.
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
     * @function
     * @name returnSegmentTemplateFromAdapationSet
     * @description Returns the segment template from the adaptionset
     * @public
     * @param AdapationSet
     * @returns {{}} - Returns the segmentTemplate as a javascript object from the adaptionSet
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
     * @function
     * @name returnMimeTypeFromAdaptionSet
     * @description Returns the mimeType from the adaptionSet
     * @public
     * @param AdaptationSet
     * @returns {string} - Returns the mimeType as a string, video/mp4 etc
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
     * @function
     * @name returnSubtitleLanguageFromAdaptionSet
     * @description Returns subtitle language from adaptionSet
     * @public
     * @param AdaptionSet
     * @returns {string} - Returns the subtitle language from the adaptionSet
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
     * @function
     * @name returnArrayOfRepresentationSetsFromAdapationSet
     * @description Return array of representations from AdaptionSet
     * @public
     * @param AdaptionSet
     * @returns {Array} - Returns an array of representationSets from the adaptionSet
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

    /**
     * @function
     * @name returnArrayOfContentComponentsFromAdaptionSet
     * @description Return array of content components from an AdaptionSet
     * @public
     * @param AdaptionSet
     * @returns {Array} - Returns an array of content components from an adaptionSet
     */
    function returnArrayOfContentComponentsFromAdaptionSet(AdaptionSet){
        var returnArray = [],
            arrayOfContentComponents = [];
        try {
            arrayOfContentComponents = AdaptionSet.ContentComponent;
            if(Object.prototype.toString.call(arrayOfContentComponents) === '[object Array]'){
                //We have an array of contentComponents
                returnArray = arrayOfContentComponents;
            }
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
    /**
     * @function
     * @name returnBaseUrlFromRepresentation
     * @description Returns the base url from the supplied representation object (a javascript object)
     * @param Representation
     * @returns {string} - Returns the base url
     */
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

    /**
     * @function
     * @name returnMimeTypeFromRepresentation
     * @description Returns the mimeType from the representation object
     * @param Representation
     * @returns {string} - Returns the mimeType (video/mp4 etc) from the representation object
     */
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

    /**
     * @function
     * @name returnCodecsFromRepresentation
     * @description Returns the codecs from the representation object
     * @param Representation
     * @returns {string} - Returns the codec from the representation
     */
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

    /**
     * @function
     * @name returnStartNumberFromRepresentation
     * @description Returns the start number from a supplied representation object
     * @param Representation
     * @returns {number} - Returns the start number from a supplied representation object
     */
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

    /**
     * @function
     * @name returnArrayOfBaseUrlObjectsFromArrayOfRepresentations
     * @description Returns an array of baseUrlObjects from an array containing representation objects
     * @param arrayOfRepresentations
     * @returns {Array} - An array of baseUrlObjects
     */
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

            //Lets try reordering the array into bandwidth based, so we will reorder the array based on bandwidth
            //and also add a property bandwidthIndex, which will start from the lowest bandwidth and then continue upward
            arrayOfBaseUrlObjects = returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate(arrayOfBaseUrlObjects);

            for(var j = 0, arrayOfBaseUrlObjectsFormattedLength = arrayOfBaseUrlObjects.length; j < arrayOfBaseUrlObjectsFormattedLength; j++){
                arrayOfBaseUrlObjects[j].bandwidthIndex = j;
            }
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse and extract the array of base urls from the array of representations, checkt input';
                messageObject.methodName = 'returnArrayOfBaseUrlsFromArrayOfRepresentations';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return arrayOfBaseUrlObjects;
    };

    //  ##################################
    //  #### SEGMENT TEMPLATE METHODS ####
    //  ##################################
    /**
     * @function
     * @name returnDurationFromSegmentTemplate
     * @description Returns the duration from a segment template
     * @param SegmentTemplate
     * @returns {number}
     */
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

    /**
     * @function
     * @name returnInitializationFromSegmentTemplate
     * @description Returns the initialization file location from the segment template
     * @param SegmentTemplate
     * @returns {string} - initialization file location
     */
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

    /**
     * @function
     * @name returnMediaStructureAsObjectFromSegmentTemplate
     * @description Returns the media structure as an object from the segment template, containing segmentPrefix and segmentSuffic etc as object properties
     * @param SegmentTemplate
     * @returns {object} - mediaStructureObject
     */
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
                messageObject.moduleVersion = moduleVersion;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnObject;
    };

    //  #########################
    //  #### GENERAL METHODS ####
    //  #########################

    /**
     * @function
     * @name returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate
     * @description This method reorders the base url objects array in order based on the higest bitrate value
     * @param arrayOfBaseUrlObjects
     * @public
     * @returns {Array}
     */
    function returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate(arrayOfBaseUrlObjects){
        var returnArray = arrayOfBaseUrlObjects;

        try {
            returnArray.sort(_sortObjectOnBandwidthProperty);
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse and extract the array of base urls from the array of base urls, check input';
                messageObject.methodName = 'returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return returnArray;
    };

    /**
     * @function
     * @name _sortObjectOnBandwidthProperty
     * @description An internal compare function to
     * @param a
     * @param b
     * @returns {number}
     * @private
     */
    function _sortObjectOnBandwidthProperty(a, b){
        if(a.bandwidth < b.bandwidth){
            return -1;
        } else if(a.bandwidth > b.bandwidth){
            return 1;
        } else {
            return 0
        }
    }

    /**
     * @function
     * @name getMpd
     * @description This method makes the XMLHttp request and fetches the actual mpd manifest file
     * @public
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

    /**
     * @function
     * @name returnTypeFromMimeTypeAndCodecString
     * @description Returns the type based on mimeType and codec, like video if mimeType=video/mp4 and codec=h264
     * @param mimeType
     * @param codecString
     * @returns {string} - Type (like video or audio)
     */
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

    /**
     * @function
     * @name setMpdObject
     * @description Sets the mpdObject as a class scoped variable
     * @param mpdObject
     */
    function setMpdObject(mpdObject){
        currentVideoObject.mpdObject = mpdObject;
    };

    /**
     * @function
     * @name getMpdObject
     * @description gets the mpdObject from a class scoped variable
     * @returns {object} - mpdObject
     */
    function getMpdObject(){
        return currentVideoObject.mpdObject;
    };

    /**
     * @function
     * @name returnStreamBaseUrlFromMpdUrl
     * @description Returns the stream base url from the mpdUrl
     * @param mpdUrl
     * @returns {string} - streamBaseUrl
     */
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

    /**
     * @function
     * @name checkIfMultipleAdaptionSets
     * @description Checks if we have multiple adaptions sets. This method has not been completed yet.
     * @returns {boolean}
     */
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

    /**
     * @function
     * @name checkIfAdapationSetContainSingleRepresentation
     * @description Checks to see if the provided adaptionSet contains a single representation set, returns true or false
     * @param AdaptionSet
     * @returns {boolean}
     */
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
    that.returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate = returnReorderedArrayOfBaseUrlObjectsIntoHighestBitrate;

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