/**
 * @title FREE VIDEO PLAYER - MODULE NAMESPACE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @dependencies Requires the xml2json library to work
 * @description Creates a namespace to be used with the FREE VIDEO PLAYER library and its modules
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 */

/**
 * @description Defines the global namespace where free video player modules can be added to as property objects
 * @type {{}}
 */
var freeVideoPlayerModulesNamespace = {};


/**
 * @title FREE VIDEO PLAYER - MESSAGES MODULE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @description A messages module to use with for example FREE VIDEO PLAYER library.
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 * @param settingsObject - {object} Contains different settings for the messages
 * @param moduleVersion -  {string} Contains the version string for the module that is calling the messages module
 */
//Add the messages module to the namespace
freeVideoPlayerModulesNamespace.freeVideoPlayerMessages = function(settingsObject, moduleVersion){

    'use strict';

    /**
     * @description Instantiate the variables we need when setting up this messages module
     * @type {{}}
     */
    var that = {},
        moduleName = 'Messages',
        moduleVersion = moduleVersion,
        freeVideoPlayerWebUrl = 'http://freevideoplayer.org',
        version = '0.9.0';

    //Indicate that the returned object is a module
    that._isModule = true;

    //  #########################
    //  #### MESSAGE METHODS ####
    //  #########################
    /**
     * @description A method that generates an error message on the console
     * @param messageObject
     * @param error
     */
    function printOutErrorMessageToConsole(messageObject, error){

        var consoleMessage = '',
            message = messageObject.message,
            methodName = messageObject.methodName,
            moduleName = messageObject.moduleName;

        consoleMessage += '====================================================' + '\n';
        consoleMessage += 'Free Video Player Library - ERROR' + '\n';
        consoleMessage += 'ModuleName: ' + moduleName + '\n';
        consoleMessage += 'ModuleVersion: ' + moduleVersion + '\n';
        consoleMessage += 'See more @: ' + freeVideoPlayerWebUrl + '\n';
        consoleMessage += 'Method: ' + methodName + '\n';
        consoleMessage += 'Message: ' + message + '\n';
        consoleMessage += '====================================================' + '\n';

        if(settingsObject.debugMode) {
            console.log(consoleMessage);
            console.log(error);
        }
    };

    /**
     * @description A method that generates a message on the console
     * @param messageObject
     */
    function printOutMessageToConsole(messageObject){

        var consoleMessage = '',
            message = messageObject.message,
            methodName = messageObject.methodName,
            moduleName = messageObject.moduleName;

        consoleMessage += '====================================================' + '\n';
        consoleMessage += 'Free Video Player Library - MESSAGE' + '\n';
        consoleMessage += 'ModuleName: ' + moduleName + '\n';
        consoleMessage += 'ModuleVersion: ' + moduleVersion + '\n';
        consoleMessage += 'See more @: ' + freeVideoPlayerWebUrl + '\n';
        consoleMessage += 'Method: ' + methodName + '\n';
        consoleMessage += 'Message: ' + message + '\n';
        consoleMessage += '====================================================' + '\n';

        if(settingsObject.debugMode) {
            console.log(consoleMessage);
        }
    };

    //Make methods public
    that.printOutErrorMessageToConsole  = printOutErrorMessageToConsole;
    that.printOutMessageToConsole = printOutMessageToConsole;
    that.moduleName = moduleName;
    that.version = version;

    //Return our class/function object
    return that;
};

/**
 * @title FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @description A video controls module to use with the FREE VIDEO PLAYER library.
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 * @param settingsObject {object} - Contains the settings the videoControlsModule needs to utilize
 * certain methods on the instantiated Free Video Player object
 * @param videoPlayerNameCss {string} - Used as name string for the messagesModule that the videoControlsModule utilizes
 */
//Add the video controls to the namespace
freeVideoPlayerModulesNamespace.freeVideoPlayerControls = function(settingsObject, videoPlayerNameCss){
    'use strict';

    /**
     * @description Lets instantiate the different variables we will be needing when we start up this controls module
     * @type {{}}
     */
    var that = {},
        settingsObject = settingsObject,
        version = '0.9.0',
        moduleName = 'VIDEO CONTROLS',
        animationDelayObject = {
          videoOverlayFadeOutDelay:100
        },
        videoPlayerNameCss = videoPlayerNameCss,
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, version);

    //Indicate that the returned object is a module
    that._isModule = true;

    /**
     * @description This methods manipulates the DOM and creates object like subtitle tracks within the DOM
     * aswell as the rest of the control structure, like play/pause button, progress-slider, mute button, volume slider,
     * subtitle selector with sub-menu and fullscreen button
     * @param {element} videoWrapper - The DOM element for the videoWrapper
     * @param {element} currentVideoObject - The DOM video element
     * @public
     */
    function _createVideoControls(videoWrapper, currentVideoObject){

        var videoWrapper = videoWrapper,
            currentControls = videoWrapper.getElementsByTagName('div')[0] || null,
            videoElement = videoWrapper.getElementsByTagName('video')[0] || null,
            volumeHighStart = parseInt(settingsObject.videoControlsVolumeTresholdValues.volumeHighStart, 10),
            volumeLowEnd = parseInt(settingsObject.videoControlsVolumeTresholdValues.volumeLowEnd, 10),
            controlsWrapper = document.createElement('div'),
            mediaType = currentVideoObject.mediaType || 'static';
        controlsWrapper.setAttribute('data-video-player-control', 'wrapper');
        controlsWrapper.setAttribute('class', settingsObject.videoControlsCssClasses.videoControlsClass);

        //Add the data to the class scoped variables
        that.currentVideoObject = currentVideoObject;
        that.videoElement = videoElement;
        that.currentVideoControlsObject = {
            volumeHighStart: volumeHighStart,
            volumeLowEnd: volumeLowEnd
        };

        //Lets remove the older controls div before adding the new one
        if(currentControls){
            //Remove old control structure
            videoWrapper.removeChild(currentControls);
            //Remove old keyboard listeners
            _removeKeyboardListeners();
            //Reset previous controls
            that.currentVideoControlsObject = {};
        }

        var playButton = document.createElement('div'),
            volumeIcon = document.createElement('div'),
            fullScreenButton = document.createElement('div'),
            progressSlider = document.createElement('input'),
            volumeSliderContainer = document.createElement('div'),
            volumeSlider = document.createElement('input'),
            progressTimerContainer = document.createElement('div'),
            progressTimerCurrentTime = document.createElement('span'),
            progressTimerTotalDuration = document.createElement('span'),
            videoOverlayPlayPauseIcon = document.createElement('div'),
            videoOverlaySpinnerIcon = document.createElement('div'),
            settingsIcon = document.createElement('div'),
            settingsMenu = document.createElement('div'),
            videoFormatContainer = document.createElement('div'),
            subtitlesContainer = document.createElement('div'),
            bitrateButton = document.createElement('div'),
            liveIcon = document.createElement('div');


        //Adding the data to class scoped variable
        that.currentVideoControlsObject.playButton = playButton;
        that.currentVideoControlsObject.volumeIcon = volumeIcon;
        that.currentVideoControlsObject.fullScreenButton = fullScreenButton;
        that.currentVideoControlsObject.progressSlider = progressSlider;
        that.currentVideoControlsObject.volumeSliderContainer = volumeSliderContainer;
        that.currentVideoControlsObject.volumeSlider = volumeSlider;
        that.currentVideoControlsObject.progressTimerContainer = progressTimerContainer;
        that.currentVideoControlsObject.progressTimerCurrentTime = progressTimerCurrentTime;
        that.currentVideoControlsObject.progressTimerTotalDuration = progressTimerTotalDuration;
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon = videoOverlayPlayPauseIcon;
        that.currentVideoControlsObject.videoOverlaySpinnerIcon = videoOverlaySpinnerIcon;
        that.currentVideoControlsObject.controlsWrapper = controlsWrapper;
        that.currentVideoControlsObject.settingsIcon = settingsIcon;
        that.currentVideoControlsObject.settingsMenu = settingsMenu;
        that.currentVideoControlsObject.subtitlesContainer = subtitlesContainer;
        that.currentVideoControlsObject.bitrateButton = bitrateButton;
        that.currentVideoControlsObject.videoFormatContainer = videoFormatContainer;
        that.currentVideoControlsObject.liveIcon = liveIcon;

        //DO MORE STUFF WITH PROGRESS TIMER ETC
        //LETS UPDATE THIS ON THE FLY AS THE VIDEO PROGRESSES!

        //Lets add the progressSlider to our currentVideoObject
        currentVideoObject.progressSlider = progressSlider;

        //  ###################################
        //  #### SET ATTRIBUTES/INNER HTML ####
        //  ###################################
        //Lets set classes to the different objects
        playButton.setAttribute('class', settingsObject.videoControlsCssClasses.playpauseContainerClass);
        progressSlider.setAttribute('class', settingsObject.videoControlsCssClasses.progressbarContainerClass);
        volumeSliderContainer.setAttribute('class', settingsObject.videoControlsCssClasses.volumeContainerClass);
        volumeIcon.setAttribute('class', settingsObject.videoControlsCssClasses.volumeIconClass);
        subtitlesContainer.setAttribute('class', settingsObject.videoControlsCssClasses.subtitlesMenuContainerClass);

        fullScreenButton.setAttribute('class', settingsObject.videoControlsCssClasses.fullscreenContainerClass);
        progressTimerContainer.setAttribute('class', settingsObject.videoControlsCssClasses.progressTimerContainerClass);
        videoOverlayPlayPauseIcon.setAttribute('class', settingsObject.videoControlsCssClasses.videoOverlayPlayPauseIconClass);
        videoOverlaySpinnerIcon.setAttribute('class', settingsObject.videoControlsCssClasses.videoOverlaySpinnerIconClass);
        settingsIcon.setAttribute('class', settingsObject.videoControlsCssClasses.settingsIconClass);
        settingsMenu.setAttribute('class', settingsObject.videoControlsCssClasses.settingsMenuClass + ' ' + settingsObject.videoControlsCssClasses.displayNoneClass);
        videoFormatContainer.setAttribute('class', settingsObject.videoControlsCssClasses.videoFormatContainerClass);
        liveIcon.setAttribute('class', settingsObject.videoControlsCssClasses.liveIconClass);

        //Add some attributes to our sliders
        volumeSlider.setAttribute('type','range');
        volumeSlider.setAttribute('value', 100);
        volumeSlider.setAttribute('orient', 'vertical');
        progressSlider.setAttribute('type','range');
        progressSlider.setAttribute('value', 0);

        //Add the data attribute to the different elements, maybe we should use this for selection in the future
        playButton.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'playpause');
        volumeIcon.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'mute');
        subtitlesContainer.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'subtitles');
        fullScreenButton.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'fullscreen');
        progressTimerContainer.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'progress-timer');
        progressSlider.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'progress');
        volumeSlider.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'volume');
        videoOverlayPlayPauseIcon.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'video-overlay-play-pause');
        videoOverlaySpinnerIcon.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'video-overlay-spinner');
        settingsIcon.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'settings');

        //Paint our DOM with the correct HTML
        playButton.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
        volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeHighIconInnerHtml;
        fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenExpandIconInnerHtml;
        subtitlesContainer.innerHTML = settingsObject.videoControlsInnerHtml.subtitlesMenuInnerHtml;
        settingsIcon.innerHTML = settingsObject.videoControlsInnerHtml.settingsIconInnerHtml;
        progressTimerCurrentTime.innerHTML = '0:00';
        videoFormatContainer.innerHTML = settingsObject.videoControlsInnerHtml.videoFormatContainerInnerHtml;
        liveIcon.innerHTML = settingsObject.videoControlsInnerHtml.liveIconInnerHtml;

        //  #############################
        //  #### ADD EVENT LISTENERS ####
        //  #############################

        videoOverlayPlayPauseIcon.addEventListener('click', _playPauseMethod);

        playButton.addEventListener('click', _playPauseMethod);
        fullScreenButton.addEventListener('click', _fullScreenMethod);

        progressSlider.addEventListener('change', _progressShiftMethod);
        progressSlider.addEventListener('mousedown', _pauseMethodFromSlider);
        progressSlider.addEventListener('mouseup', _playMethodFromSlider);

        volumeIcon.addEventListener('click', _volumeMuteUnmuteMethod);
        volumeIcon.addEventListener('mouseover', _showVolumeSlider);
        volumeIcon.addEventListener('mouseout', _hideVolumeSlider);

        volumeSliderContainer.addEventListener('mouseout', _hideVolumeSlider);

        volumeSlider.addEventListener('change', _volumeShiftMethod);

        settingsIcon.addEventListener('click', _changeSettings);

        //Lets add event listeners to the video element so we can update the progress bar when we need it
        videoElement.addEventListener('loadedmetadata', _printMediaTotalDuration);
        videoElement.addEventListener('timeupdate', _progressUpdateMethod);

        //Lets see if we have subtitles and if that is the case lets add the subtitle menu to the player controls
        var subtitlesMenu = _createSubtitlesMenuAndReturnMenu(videoElement);

        if(subtitlesMenu){
            //Lets add the subtitles menu to the subtitles button
            subtitlesContainer.addEventListener('click', function(event){
                subtitlesMenu.style.display = (subtitlesMenu.style.display === 'block' ? 'none' : 'block');
            });
        }

        //  #############################
        //  #### APPEND DOM ELEMENTS ####
        //  #############################
        progressTimerContainer.appendChild(progressTimerCurrentTime);
        progressTimerContainer.appendChild(progressTimerTotalDuration);

        //Lets add the videoFormat to the videoFormatContainer within
        //the settings menu
        videoFormatContainer = _addAndReturnVideoFormatName(videoFormatContainer);
        settingsMenu.appendChild(videoFormatContainer);

        //Lets add the volume slider to the volume slider container
        volumeSliderContainer.appendChild(volumeSlider);
        //Move this part..?
        currentVideoObject.volumeSliderContainer = volumeSliderContainer;

        //LETS ALSO ADD VERIFICATION FOR LIVE ASSETS HERE, IF LIVE WE SHOULD NOT DISPLAY PROGRESS BAR
        if(settingsObject.videoControlsDisplay.showProgressSlider
            && mediaType === 'static') {
            //Adds both the progress bar and the progress timer container showing current time and the medias
            controlsWrapper.appendChild(progressSlider);
        }

        if(settingsObject.videoControlsDisplay.showPlayPauseButton){
            controlsWrapper.appendChild(playButton);
        }

        if(settingsObject.videoControlsDisplay.showVolumeIcon){
            volumeIcon.appendChild(volumeSliderContainer);
            controlsWrapper.appendChild(volumeIcon);
        }
        if(settingsObject.videoControlsDisplay.showVolumeSlider){
            //controlsWrapper.appendChild(volumeSliderContainer);
        }
        if(subtitlesMenu
            && settingsObject.videoControlsDisplay.showSubtitlesMenu){
            subtitlesContainer.appendChild(subtitlesMenu);
            settingsMenu.appendChild(subtitlesContainer);
        }

        if(settingsObject.videoControlsDisplay.showSettingsIcon){
            controlsWrapper.appendChild(settingsIcon);
        }

        if(settingsObject.videoControlsDisplay.showTimer
            && mediaType === 'static'){
            controlsWrapper.appendChild(progressTimerContainer);
        }

        if(settingsObject.videoControlsDisplay.showFullScreenButton){
            controlsWrapper.appendChild(fullScreenButton);
        }

        //Lets add the live icon if the asset is LIVE
        if(mediaType !== 'static'){
            videoWrapper.appendChild(liveIcon);
        }

        //Lets add the settingsIcon to the videoControls
        settingsIcon.appendChild(settingsMenu);

        //Add stuff to the videoWrapper
        videoWrapper.appendChild(videoOverlaySpinnerIcon);
        videoWrapper.appendChild(videoOverlayPlayPauseIcon);
        videoWrapper.appendChild(controlsWrapper);

        //Lets now also add keyboard events to
        //the different buttons we want our player to interact with from the keyboard.
        _createKeyboardListeners();
    };


    /**
     * @description A helper method to add the videoFormatName to the videoFormatContainer
     * @param videoFormatContainer
     * @returns {*}
     * @private
     */
    function _addAndReturnVideoFormatName(videoFormatContainer){

        var videoFormat = that.currentVideoObject.videoFormat,
            span = document.createElement('span');

        span.innerHTML = videoFormat;
        videoFormatContainer.appendChild(span);

        return videoFormatContainer;
    }


    /**
     * @description A method that in turn will modify the settingsMenu on videoControls to correspond
     * to different choices the user has to decide which quality the video should be streamed at.
     * @param typeOfStream
     * @param bitrateObjectsArray
     * @private
     */
    function _addBitrateMenuToSettingsIcon(typeOfStream, bitrateObjectsArray){
        console.log('Reached the bitrate object method on video controls module');
        console.log('The stream is..' + typeOfStream);
        if(typeOfStream !== 'audio'){
            //Should be video or videoAndAudio stream now
            var bitrateMenuContainer = document.createElement('div'),
                bitrateMenu = document.createElement('ul'),
                bitrateObjectArrayLength = bitrateObjectsArray.length;

            //Add classes and html to the actual bit
            bitrateMenuContainer.innerHTML = settingsObject.videoControlsInnerHtml.bitrateQualityMenuInnerHtml;
            bitrateMenuContainer.setAttribute('class', settingsObject.videoControlsCssClasses.bitrateQualityMenuContainerClass);
            bitrateMenuContainer.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'quality')

            bitrateMenu.setAttribute('class', settingsObject.videoControlsCssClasses.bitrateQualityMenuClass)

            for(var i = 0; i < bitrateObjectArrayLength; i++){
                var bitrateItem = document.createElement('li');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-index', bitrateObjectsArray[i].index);
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url', bitrateObjectsArray[i].baseUrl);
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
                bitrateItem.innerHTML = bitrateObjectsArray[i].width;
                bitrateItem.addEventListener('click', _changeVideoBitrate);
                bitrateMenu.appendChild(bitrateItem);
            }

            //Lets add an auto option here
            if(bitrateObjectArrayLength > 0){
                //Lets create the auto option last
                var bitrateItem = document.createElement('li');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-index', 'auto');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url', 'auto');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-state', 'active');
                bitrateItem.innerHTML = 'auto';
                bitrateItem.addEventListener('click', _changeVideoBitrate);
                bitrateMenu.appendChild(bitrateItem);
            }

            bitrateMenuContainer.appendChild(bitrateMenu);
            that.currentVideoControlsObject.settingsMenu.appendChild(bitrateMenuContainer);
        }
    };

    function _changeVideoBitrate(){

        var elementTagName = this.nodeName,
            baseUrl = this.getAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url'),
            listElement = this.parentNode,
            listElements = listElement.getElementsByTagName(elementTagName);

        for(var i = 0, listLength = listElements.length; i < listLength; i++ ){
            //Lets reset all items to be not selected
            listElements[i].setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
        }
        //Lets set this current item to be active
        this.setAttribute('data-' + videoPlayerNameCss + '-state', 'active');

        console.log('Hey clicked videoBitrate..');
        console.log('Consoling out the buttion?');
        console.log(this);
        console.log('The base url is...' + baseUrl);
        //Now lets also save the baseUrl we fetched from the DOM node
        that.currentVideoObject.currentVideoBaseUrl = baseUrl;
    };

    //  ##########################
    //  #### CONTROL METHODS ####
    //  ##########################
    /**
     * @description This method makes the video play or pause depending on its current state,
     * will also paint out different states in the DOM both for the controls and the videoOverlay
     * @private
     */
    function _playPauseMethod(){
        if(!that.currentVideoObject.playing){
            that.videoElement.play();
            _addPauseIconToControls();
            _addPlayIconToVideoOverlay();
            that.currentVideoObject.playing = true;

        } else {
            that.videoElement.pause();
            _addPlayIconToControls();
            _addPauseIconToVideoOverlay();
            that.currentVideoObject.playing = false;
        }
    };

    /**
     * @description Adds a play icon to the controls
     * @private
     */
    function _addPlayIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
    };

    /**
     * @description Adds a pause icon to the controls
     * @private
     */
    function _addPauseIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
    };

    /**
     * @description Adds a spinner icon to the video overlay
     * @private
     */
    function _addSpinnerIconToVideoOverlay(){
        that.currentVideoControlsObject.videoOverlaySpinnerIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
    };

    /**
     * @description Removes the spinner icon from the video overlay
     * @private
     */
    function _removeSpinnerIconFromVideoOverlay(){
        that.currentVideoControlsObject.videoOverlaySpinnerIcon.innerHTML = '';
    };

    /**
     * @description A method called when the progress slider is moved, if the current state of the videoElement
     * is playing then the video should continue playing, otherwise the state should be stopped/paused.
     * @private
     */
    function _playMethodFromSlider(){
        if(that.currentVideoObject.playing){
            that.videoElement.play();
            _addPauseIconToControls();
            that.currentVideoObject.playing = true;
        } else {
            _pauseMethodFromSlider();
            that.currentVideoObject.playing = false;
        }
    };

    /**
     * @description A method to pause the videoElement, utilized as a sub-method when the slider is moved
     * @private
     */
    function _pauseMethodFromSlider(){
        that.videoElement.pause();
        //that.currentVideoObject.playing = false;
        _addPlayIconToControls();
    };

    /**
     * @desciption A method to shift the volume up and down
     * @private
     */
    function _volumeShiftMethod(){
        var newVolumeValue = 0;
        if(that.currentVideoControlsObject.volumeSlider.value >= that.currentVideoControlsObject.volumeHighStart){
            that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeHighIconInnerHtml;
        } else if(that.currentVideoControlsObject.volumeSlider.value < that.currentVideoControlsObject.volumeHighStart
            && that.currentVideoControlsObject.volumeSlider.value > that.currentVideoControlsObject.volumeLowEnd) {
            that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeLowIconInnerHtml;
        } else {
            that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.novolumeIconInnerHtml;
        }
        //adding the actual volume slider container after we have made a change
        that.currentVideoControlsObject.volumeIcon.appendChild(that.currentVideoObject.volumeSliderContainer);
        newVolumeValue = that.currentVideoControlsObject.volumeSlider.value/100;
        that.videoElement.volume = newVolumeValue;
        //Lets always set volume to unmute when we are moving the volume slider
        that.currentVideoObject.muted = false;
        that.currentVideoObject.volumeSliderContainer.style.visibility = 'hidden';
    };

    /**
     * @description A method to mute and unmute the volume for the videoElement aswell as modifying the position of the
     * volume slider. Also if the volume is muted the last known volume value will be saved so the volume slider will
     * return to this value once unmuted.
     * @private
     */
    function _volumeMuteUnmuteMethod(){
        if(that.currentVideoObject.muted){
            that.videoElement.volume = that.currentVideoObject.volumeBeforeMute;
            that.currentVideoControlsObject.volumeSlider.value = that.currentVideoObject.volumeBeforeMute*100;
            that.currentVideoObject.muted = false;

            if(that.currentVideoControlsObject.volumeSlider.value >= that.currentVideoControlsObject.volumeHighStart){
                that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeHighIconInnerHtml;
                that.currentVideoControlsObject.volumeIcon.appendChild(that.currentVideoObject.volumeSliderContainer);
            }
            else if(that.currentVideoControlsObject.volumeSlider.value > that.currentVideoControlsObject.volumeLowEnd
                && that.currentVideoControlsObject.volumeSlider.value < that.currentVideoControlsObject.volumeHighStart){
                that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeLowIconInnerHtml;
                that.currentVideoControlsObject.volumeIcon.appendChild(that.currentVideoObject.volumeSliderContainer);
            } else {
                that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.novolumeIconInnerHtml;
                that.currentVideoControlsObject.volumeIcon.appendChild(that.currentVideoObject.volumeSliderContainer);
                //Lets set a lowest value here if we want to unmute the volume slider..?
            }
        } else {
            that.currentVideoObject.volumeBeforeMute = that.currentVideoControlsObject.volumeSlider.value/100;
            that.videoElement.volume = 0;
            that.currentVideoControlsObject.volumeSlider.value = 0;
            that.currentVideoObject.muted = true;
            that.currentVideoControlsObject.volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.novolumeIconInnerHtml;
        }
    };

    /**
     * @description A method to shift to a new position within the videoElement, basically seeking to a new position and
     * also updating the controls as we do this
     * @private
     */
    function _progressShiftMethod(){
        //First get the total value of the asset.
        var videoDurationInSeconds = that.currentVideoObject.mediaDurationInSeconds,
            newPosition = Math.floor((that.currentVideoControlsObject.progressSlider.value/100)*videoDurationInSeconds);
        //Seek to new position
        that.videoElement.currentTime = newPosition;
        console.log('The current video object playing is...' + that.currentVideoObject.playing);

        if(!that.currentVideoObject.playing){
            _pauseMethodFromSlider();
        }
    };

    /**
     * @description A method that can be called continuasly to update the progress bar of the current video position.
     * @private
     */
    function _progressUpdateMethod(){
        var videoDurationInSeconds = that.currentVideoObject.mediaDurationInSeconds,
            currentPosition = that.videoElement.currentTime,
            progressInPercentage = Math.round((currentPosition/videoDurationInSeconds)*100);

            that.currentVideoControlsObject.progressTimerCurrentTime.innerHTML = _returnHoursMinutesSecondsFromSeconds(currentPosition),
            that.currentVideoControlsObject.progressSlider.value = progressInPercentage;
    };

    /**
     * @description A method that can be called to print the total media duration of an asset
     * @private
     */
    function _printMediaTotalDuration(){
        //Lets update the media total duration span
        that.currentVideoControlsObject.progressTimerTotalDuration.innerHTML = '/' + _returnHoursMinutesSecondsFromSeconds(that.currentVideoObject.mediaDurationInSeconds);
    };

    /**
     * @description A method will make the volume slider visible
     * @private
     */
    function _showVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="visible";
    };

    /**
     * @description A method that will make the volume slider not visible
     * @private
     */
    function _hideVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="hidden";
    };

    /**
     * @description A method that will make changes to the settings easy :).
     * @private
     */
    function _changeSettings(){
        console.log('Clicked settings button');
        console.log('Lets try adding css classes here');
        if(_checkIfElementHasCssClassReturnBoolean(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)){
            _removeCssClassToElementAndReturn(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)
        } else {
            _addCssClassToElementAndReturn(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)
        }
    };

    /**
     * @description A method that will enable full screen mode on the Free Video Player
     * @private
     */
    function _fullScreenMethod(){
        if (that.videoElement.requestFullscreen) {
            that.videoElement.requestFullscreen();
        } else if (that.videoElement.mozRequestFullScreen) {
            that.videoElement.mozRequestFullScreen();
        } else if (that.videoElement.webkitRequestFullscreen) {
            that.videoElement.webkitRequestFullscreen();
        } else {
            var messageObject = {};
                messageObject.message = 'Could not enter fullscreen mode, check if browser is compatible';
                messageObject.methodName = '_createVideoControls';
                messageObject.moduleName = moduleName;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    //  ###############################
    //  #### VIDEO OVERLAY METHODS ####
    //  ###############################
    /**
     * @description A method that adds a play icon to the video overlay
     * @private
     */
    function _addPlayIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    /**
     * @description A method that adds a pause icon to the video overlay
     * @private
     */
    function _addPauseIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    /**
     * @description A method that adds a spinner icon to the video overlay
     * @private
     */
    function _addSpinnerIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
    };

    /**
     * @description A method that removes the spinner icon from the video overlay
     * @private
     */
    function _removeSpinnerIconFromVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    //  #####################
    //  #### CSS METHODS ####
    //  #####################
    /**
     * @description A method that adds a css class to an an element
     * @param element
     * @param className
     * @private
     */
    function _addCssClassToElementAndReturn(element, className){
        var classString = element.getAttribute('class');
        classString = classString + ' ' + className;
        try {
            setTimeout(function(){
                element.setAttribute('class', classString);
            }, animationDelayObject.videoOverlayFadeOutDelay);
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not add css class to element and return after small delay';
                messageObject.methodName = '_addCssClassToElementAndReturn';
                messageObject.moduleName = moduleName;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    /**
     * @description A method that removes a css class from an an element
     * @param element
     * @param className
     * @private
     */
    function _removeCssClassToElementAndReturn(element, className){
        var classString = element.getAttribute('class');
        classString = classString.split(className);
        if(classString.length > 0){
            // If we found an instance of the className and split
            // into at least to different parts
            // we should now fetch the first instance
            classString = classString[0].trim();
        } else {
            //Do nothing here
        }
        element.setAttribute('class', classString);
    };

    /**
     * @description A utility method meant to be able to filter.
     * @param element
     * @param className
     * @returns {boolean}
     * @private
     */
    function _checkIfElementHasCssClassReturnBoolean(element, className){
        var classString = element.getAttribute('class'),
            elementHasClass = false;

        classString = classString.split(className);

        if(classString.length > 1){
            // If we found an instance of the className and split
            // into at least to different parts
            // we should now fetch the first instance
            elementHasClass = true;
        }
        return elementHasClass;
    };

    //  #########################
    //  #### KEYBOARD EVENTS ####
    //  #########################
    /**
     * @description A method that aggregates the methods that will add keyboard eventListeners to the Free Video Player
     * @private
     */
    function _createKeyboardListeners(){
        //Add event listener for space button - play/pause
        _createPlayPauseSpaceBarListener();
        //Lets add more listeners here
    };

    /**
     * @description An overall method to remove eventListeners connected to the keyboard, if say a previous asset was loaded and
     * a new one is loaded.
     * @private
     */
    function _removeKeyboardListeners(){
        //Remove space bar key listener
      _removePlayPauseSpaceBarListener();
    };

    /**
     * @description A method that enables to play/pause from the keyboard spacebar.
     * @private
     */
    function _createPlayPauseSpaceBarListener(){
        document.addEventListener('keypress', _spaceBarKeyPress);
    };

    /**
     * @description The method that removes the play/pause button from the spacebar.
     * @private
     */
    function _removePlayPauseSpaceBarListener(){
        try {
            document.removeEventListener('keypress', _spaceBarKeyPress);
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not remove play/pause spacebar eventlistener';
                messageObject.methodName = '_removePlayPauseSpaceBarListener';
                messageObject.moduleName = moduleName;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    /**
     * @description The actual method that catches the event from the spacebar button
     * @param event
     * @private
     */
    function _spaceBarKeyPress(event){
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }
        if (code === 32 || code === 0) {
            event.preventDefault();
            _playPauseMethod();
        }
    };


    //  ################################
    //  #### CALCULATE TIME METHODS ####
    //  ################################
    /**
     * @description A method that calculates and returns a Hours Minutes and Seconds string from Seconds
     * @param seconds
     * @returns {string}
     * @private
     */
    function _returnHoursMinutesSecondsFromSeconds(seconds){
        var returnHourMinutesSeconds = '0:00';
            try {
                var roundedSeconds = Math.round(parseInt(seconds, 10)),
                    minutes = Math.floor(roundedSeconds/60),
                    hours = Math.floor(roundedSeconds/3600),
                    seconds = roundedSeconds - (minutes * 60);

                if(hours == 0){
                    hours = '';
                }

                if(hours < 10
                && hours > 0){
                    hours = '0' + hours + ':';
                }

                if(hours >= 10){
                    hours = hours + ':';
                }

                if(seconds < 10){
                    seconds = '0' + seconds;
                }

                returnHourMinutesSeconds = hours + minutes + ':' + seconds;

            } catch(e){
                var messageObject = {};
                    messageObject.message = 'Could not parse and return hours, minutes, seconds string from seconds';
                    messageObject.methodName = 'returnHoursMinutesSecondsFromSeconds';
                    messageObject.moduleName = moduleName;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
            }
        return returnHourMinutesSeconds;
    };


    //  ################################
    //  #### BITRATE METHODS / DOM ####
    //  ################################
    /**
     * @description Creates a bitrate menu and returns that menu
     * @private
     * @param bitrateObject
     * @returns {*}
     */
    function _createBitrateMenuAndReturnMenu(bitrateObject){
        var bitrateMenu = null,
            documentFragment,
            createBitrateMenuItemConfigObject = {};
        try {

            if (videoElement.textTracks.length > 0) {
                bitrateMenu = document.createElement('div');
                bitrateMenu.innerHTML = settingsObject.videoControlsInnerHtml.bitrateMenuInnerHtml;
                documentFragment = document.createDocumentFragment();
                bitrateMenu = documentFragment.appendChild(document.createElement('ul'));
                bitrateMenu.className =  settingsObject.videoControlsCssClasses.bitrateMenuClass;
                that.currentVideoObject.bitrateMenu = bitrateMenu;
                //subtitlesMenu.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'subtitles-menu');

                //Since we are setting the language to a value here, this subtitle button will appear
                //as a choice in the menu, with label name set to the subtitlesMenuOffButtonInnerHtml,
                //and this button will act as a deactivator of subtitles
                createBitrateMenuItemConfigObject = {
                    bitrateName: 'auto',
                    bitrateIndex: 0,
                };

                bitrateMenu.appendChild(_createBitrateMenuItem(createBitrateMenuItemConfigObject));

                for (var i = 0; i < bitrateObject.length; i++) {

                    var createBitrateMenuItemConfigObject = {
                        bitrateName: bitrateObject[i].bitrateName,
                        bitrateIndex: bitrateObject[i].bitrateIndex
                    };
                    bitrateMenu.appendChild(_createBitrateMenuItem(createBitrateMenuItemConfigObject));
                }
            }
        } catch(e){

            var messageObject = {};
            messageObject.message = 'Could not create a bitrate menu and return the menu';
            messageObject.methodName = '_createBitrateMenuAndReturnMenu';
            messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return bitrateMenu;
    };



    //  ################################
    //  #### SUBTITLE METHODS / DOM ####
    //  ################################
    /**
     * @description Creates a subtitle menu and returns that menu
     * @private
     * @param videoElement
     * @returns {*}
     */
    function _createSubtitlesMenuAndReturnMenu(videoElement){
        var subtitlesMenu = null,
            documentFragment,
            createSubtitleMenuItemConfigObject = {};
        try {

            if (videoElement.textTracks.length > 0) {
                subtitlesMenu = document.createElement('div');
                subtitlesMenu.innerHTML = settingsObject.videoControlsInnerHtml.subtitlesMenuInnerHtml;
                documentFragment = document.createDocumentFragment();
                subtitlesMenu = documentFragment.appendChild(document.createElement('ul'));
                subtitlesMenu.className =  settingsObject.videoControlsCssClasses.subtitlesMenuClass;
                that.currentVideoObject.subtitlesMenu = subtitlesMenu;
                //subtitlesMenu.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'subtitles-menu');

                //Since we are setting the language to a value here, this subtitle button will appear
                //as a choice in the menu, with label name set to the subtitlesMenuOffButtonInnerHtml,
                //and this button will act as a deactivator of subtitles
                createSubtitleMenuItemConfigObject = {
                    language: settingsObject.videoControlsInnerHtml.subtitlesMenuOffButtonInnerHtml,
                    label: settingsObject.videoControlsInnerHtml.subtitlesMenuOffButtonInnerHtml,
                    videoElement: videoElement
                };


                //Lets also add the CORS configuration on the video element
                videoElement.setAttribute('crossorigin', 'anonymous');

                subtitlesMenu.appendChild(_createSubtitlesMenuItem(createSubtitleMenuItemConfigObject));

                for (var i = 0; i < videoElement.textTracks.length; i++) {

                    var createSubtitleMenuItemConfigObject = {
                        language: videoElement.textTracks[i].language,
                        label:videoElement.textTracks[i].label,
                        videoElement: videoElement
                    };
                    subtitlesMenu.appendChild(_createSubtitlesMenuItem(createSubtitleMenuItemConfigObject));
                }
            }
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not create a subtitles menu and return the menu';
                messageObject.methodName = '_createSubtitlesMenuAndReturnMenu';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return subtitlesMenu;
    };

    /**
     * @description Creates a subtitle menu item. This will be added to the subtitle menu
     * @param configObject
     * @returns {Node}
     */
    function _createSubtitlesMenuItem(configObject){

        var language = configObject.language,
            label = configObject.label,
            videoElement = configObject.videoElement,
            textTracks = videoElement.textTracks;

        var listItem = document.createElement('li'),
            button = listItem.appendChild(document.createElement('div'));

        //button.setAttribute('id', id);
        button.className = settingsObject.videoControlsCssClasses.subtitleButtonClass;
        if(language.length > 0){
            //For the empty subtitles track
            button.setAttribute('lang', language);
            button.value = label;
            button.setAttribute('data-' + videoPlayerNameCss + '-state' , 'inactive');
            button.appendChild(document.createTextNode(label));
            //Lets add an eventlistener to the subtitle button item
            button.addEventListener('click', function(event){
                //Set all buttons to inactive
                console.log('Activating the subtitle with label ' + label);

                try {
                    //Lets fetch all buttons within the subtitle menu and set those
                    //data states to inactive
                    var subtitlesMenu = that.currentVideoObject.subtitlesMenu,
                        subtitlesMenuButtonsArray = subtitlesMenu.children;

                    for(var j = 0, subtitleMenuLength = subtitlesMenuButtonsArray.length; j < subtitleMenuLength; j++){
                        subtitlesMenuButtonsArray[j].setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
                    }

                    //Lets first deactive all subtitles, setting this on the buttons so they can be styled
                    for(var i = 0, textTracksLength = textTracks.length; i < textTracksLength; i++){
                        if(textTracks[i].label === label){
                            textTracks[i].mode = 'showing';
                            this.setAttribute('data-' + videoPlayerNameCss + '-state', 'active');
                        } else {
                            textTracks[i].mode = 'hidden';
                        }
                    }
                    //Now lets set the style to display none
                    subtitlesMenu.style.display = 'none';
                } catch(e){
                    var messageObject = {};
                        messageObject.message = 'Could not activate subtitle with language';
                        messageObject.methodName = '_createSubtitlesMenuItem';
                        messageObject.moduleName = moduleName;
                    messagesModule.printOutErrorMessageToConsole(messageObject, e);
                }
            });
        }
        return button;
    };

    //Make methods public
    that.createVideoControls = _createVideoControls;
    //Spinner methods
    that.addSpinnerIconToVideoOverlay = _addSpinnerIconToVideoOverlay;
    that.removeSpinnerIconFromVideoOverlay = _removeSpinnerIconFromVideoOverlay;
    //Bitrate method, used by adaptive streaming module/player
    that.addBitrateMenuToSettingsIcon = _addBitrateMenuToSettingsIcon;
    //Return our object
    return that;
};
/**
 * @title FREE VIDEO PLAYER - MPD PARSER MODULE
 * @authors Johan Wedfelt
 * @license GPLv3, see http://www.gnu.org/licenses/gpl-3.0.en.html
 * @dependencies Requires the xml2json library to work
 * @description A cool MPD PARSER MODULE to use with the FREE VIDEO PLAYER library.
 * @version 0.9.0
 * @web http://www.freevideoplayer.org
 * @param initiationObject {object} - An initiation object used to define settings for the mpdParserModule
 */
//Lets add the mpdParser to the global namespace
freeVideoPlayerModulesNamespace.freeVideoPlayerMpdParser = function(initiationObject){

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
        mpdParserVersion = '0.9.0',
        moduleName = 'MPD PARSER',
        defaultObject = {
            debugMode:true
        },
        settingsObject = Object.assign({}, defaultObject, initiationObject),
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, mpdParserVersion);

    //Indicate that the returned object is a module
    that._isModule = true;


    //  ############################
    //  #### MPD OBJECT METHODS ####
    //  ############################


    /**
     * @description This method returns the asset type, static or dynamic, meaning LIVE or VOD
     * @public
     * @returns {string}
     */
    function returnMediaTypeFromMpdObject(){
        var mediaType = 'static';
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {
            mediaType = currentVideoObject.mpdObject._type || 'static';
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not retrieve media type from the MPD';
                messageObject.methodName = 'returnMediaTypeFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mediaType;
    };


    /**
     * @description Returns the max segment duration from the MPD object
     * @public
     * @returns {number}
     */
    function returnMaxSegmentDurationFromMpdObject(){
        var segmentDuration = 0;
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {
            var segmentDurationFull = currentVideoObject.mpdObject._maxSegmentDuration || 'M10.000S',
                segmentDuration = segmentDurationFull.split('M')[1],
                segmentDuration = segmentDuration.split('S')[0];
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not generate a max segment duration string from the MPD';
                messageObject.methodName = 'returnMaxSegmentDurationFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return segmentDuration;
    };

    /**
     * @description Returns the media duration in seconds from the MPD object
     * @public
     * @returns {number}
     */
    function returnMediaDurationInSecondsFromMpdObject(){
        var mediaDurationInSeconds = 0;
        try {
            var mediaDurationFullString = currentVideoObject.mpdObject._mediaPresentationDuration,
                mediaDurationTemporaryFullString = '';

            if(mediaDurationFullString.split('PT').length > 1){
                mediaDurationTemporaryFullString = mediaDurationFullString.split('PT')[1];
            } else {
                mediaDurationTemporaryFullString = mediaDurationFullString.split('P0DT')[1];
            }

            var hoursString = mediaDurationTemporaryFullString.split('H')[0],
                minutesString = mediaDurationTemporaryFullString.split('H')[1].split('M')[0],
                secondsString = mediaDurationTemporaryFullString.split('M')[1].split('S')[0],
                hours = parseInt(hoursString,10),
                minutes = parseInt(minutesString, 10),
                seconds = parseInt(secondsString, 10),
                hoursInSeconds = hours * 3600,
                minutesInSeconds = minutes * 60;

            //Lets add our result to the returning mediaDurationInSeconds we
            //will return
            mediaDurationInSeconds = hoursInSeconds + minutesInSeconds + seconds;

        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not get media duration string from the MPD';
                messageObject.methodName = 'returnMediaDurationInSecondsFromMpdObject';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return mediaDurationInSeconds;
    };

    /**
     * @description Returns the average segment duration from the mpd object
     * @public
     * @returns {number}
     */
    function returnAverageSegmentDurationFromMpdObject(){
        var segmentDuration = 0;
        //First lets set that the segment length should not be more than one minute
        //then we should parse the information we get
        try {
            var segmentDurationFull = currentVideoObject.mpdObject._maxSegmentDuration || 'M10S',
                segmentDuration = segmentDurationFull.split('M')[1],
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
     * @returns {Array}
     */
    function returnArrayOfAdaptionSetsFromMpdObject(){
        var returnArray = [],
            adaptionSetTemporary = [],
            mpdObject;

        try {
            mpdObject = currentVideoObject.mpdObject;
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
     * @returns {Array}
     */
    function returnArrayOfSubtitlesFromMpdObject(){
        //Should utilize low level methods to parse through and get the
        //subtitles that we need

        var arrayOfAdaptionSets = returnArrayOfAdaptionSetsFromMpdObject(currentVideoObject.mpdObject),
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

    function getVersion(){
        return mpdParserVersion;
    };


    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################
    //General
    that.getMpdObject = getMpdObject;
    that.setMpdObject = setMpdObject;
    that.getVersion = getVersion;
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
                settingsIconInnerHtml:'<i class="fa fa-cog"></i>',
                liveIconInnerHtml:'<i class="fa fa-circle"></i> LIVE',
                videoFormatContainerInnerHtml:'format: ',
                subtitlesMenuInnerHtml:'subtitles',
                bitrateQualityMenuInnerHtml:'quality',
                subtitlesMenuOffButtonInnerHtml:'Off'
            },
            videoControlsCssClasses: {
                videoControlsClass: videoPlayerNameCss + '-controls',
                hideControlClass: videoPlayerNameCss + '-controls-hide',
                displayControlClass: videoPlayerNameCss + '-controls-display',
                videoFullScreenClass: videoPlayerNameCss + '-controls-fullscreen',
                playpauseContainerClass: videoPlayerNameCss + '-controls-playpause',
                progressbarContainerClass: videoPlayerNameCss + '-controls-progress',
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
        adaptiveStreamBitrateObjectMap: new Map(),
        //used for the adaptive bitrate algo, should probably be refactored later
        currentVideoBaseUrl:'auto'
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
            that._videoElement.poster = settingsObject.videoSplashImageUrl;

            that._videoElement.addEventListener('durationchange', function(){
                currentVideoObject.mediaDurationInSeconds = that._videoElement.duration;
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

                currentVideoObject.mediaType = mpdParserModule.returnMediaTypeFromMpdObject();
                currentVideoObject.averageSegmentDuration = mpdParserModule.returnAverageSegmentDurationFromMpdObject();
                currentVideoObject.maxSegmentDuration = mpdParserModule.returnMaxSegmentDurationFromMpdObject();
                currentVideoObject.mediaDurationInSeconds = mpdParserModule.returnMediaDurationInSecondsFromMpdObject();

                //Lets set the videoFormat on our current asset on the currentVideoObject so this can be
                //be used within the video player controls for instance
                currentVideoObject.videoFormat = 'dash';

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


    var _selectBitrateFromVideoControls = function(bitrateIndex){

    };


    /**
     * @description A bitrate method, that generates an array of bitrateObjects which includes name and bitrate for
     * each representationSet, this can be used to select a bitrate the user wants to see.
     * @private
     */
    var _generateArrayOfBitratesFromArrayOfRepresentationSets = function(arrayOfRepresentationSets){

        var arrayOfBitrateObjects = [];
        try {
            //Lets do some stuff here



        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not generate an array of bitrateObjects from the array of representationSets, check input';
                messageObject.methodName = '_generateArrayOfBitratesFromArrayOfRepresentationSets';
                messageObject.moduleName = moduleName;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return arrayOfBitrateObjects;
    };


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

                var bitrateSettingObject = {};
                    bitrateSettingObject.baseUrlObjectArray = baseUrlObjectArray;
                    bitrateSettingObject.typeOfStream = typeOfStream;

                //Lets try updating our videoControls
                _updateVideoControlsWithBitrateSettings(bitrateSettingObject);

                //These two following should probably be rewritten and changed
                sourceBuffer.addEventListener('updatestart', function(){
                    console.log('Should start with update... sourceBuffer.updating should be true..' + sourceBuffer.updating);
                    videoControlsModule.addSpinnerIconToVideoOverlay();
                });

                sourceBuffer.addEventListener('update', function(){
                    console.log('Should be done with update... sourceBuffer.updating should be false..' + sourceBuffer.updating);
                    videoControlsModule.removeSpinnerIconFromVideoOverlay();
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
                    currentVideoObject.adaptiveStreamBitrateObjectMap.set(typeOfStream + '_baseUrlObjectArray', baseUrlObjectArray);

                    //Lets switch baseUrl here..
                    //We first evaulate if we want to bitrate switch from user settings or from adaptive algorithm
                    if(_isBitrateAuto()){
                       baseUrl = _returnBaseUrlBasedOnBitrateTimeSwitch(typeOfStream);
                    } else {
                       baseUrl = _returnBaseUrlBasedOnStoredUserSettings();
                    }

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
     * @description Returns the baseUrl that the users stored from the video controls menu
     * @returns {string}
     * @private
     */
    var _returnBaseUrlBasedOnStoredUserSettings = function(){
        var returnBaseUrl = currentVideoObject.currentVideoBaseUrl;
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
        if(currentVideoObject.currentVideoBaseUrl === 'auto'){
            bitrateIsAudio = true;
        }
        return bitrateIsAudio;
    };

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





