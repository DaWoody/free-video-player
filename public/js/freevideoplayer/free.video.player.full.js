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
        that.videoWrapper = videoWrapper;
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

        console.log('_addBitrateMenuToSettingsIcon - The stream is..' + typeOfStream);
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
                bitrateItem.innerHTML = bitrateObjectsArray[i].height + 'p';
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
        if(_checkIfElementHasCssClassReturnBoolean(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)){
            _removeCssClassToElementAndReturn(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)
        } else {
            _addCssClassToElementAndReturn(that.currentVideoControlsObject.settingsMenu, settingsObject.videoControlsCssClasses.displayNoneClass)
        }
    };

    /**
     * @description A method that will enable full screen mode on the Free Video Player, or disable it
     * @private
     */
    function _fullScreenMethod(){
        if (_isFullScreen()) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenExpandIconInnerHtml;
        }
        else {
            if (that.videoElement.requestFullscreen) that.videoElement.requestFullscreen();
            else if (that.videoElement.mozRequestFullScreen) that.videoElement.mozRequestFullScreen();
            else if (that.videoElement.webkitRequestFullScreen) that.videoElement.webkitRequestFullScreen();
            else if (that.videoElement.msRequestFullscreen) that.videoElement.msRequestFullscreen();
            that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenCompressIconInnerHtml;
        }
    };

    /**
     * @decription Checks if the browsers is in full-screen mode
     * @returns {boolean}
     * @private
     */
    function _isFullScreen() {
        return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    }



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
    };

    /**
     * @description An overall method to remove eventListeners connected to the keyboard, if say a previous asset was loaded and
     * a new one is loaded.
     * @private
     */
    function _removeKeyboardListeners(){
        //Remove space bar key listener
        _removePlayPauseSpaceBarAndEscFullscreenListener();
    };

    /**
     * @description A method that enables to play/pause from the keyboard spacebar.
     * @private
     */
    function _createPlayPauseSpaceBarListener(){
        document.addEventListener('keypress', _spaceBarEscKeyPress);
    };

    /**
     * @description The method that removes the play/pause button from the spacebar.
     * @private
     */
    function _removePlayPauseSpaceBarAndEscFullscreenListener(){
        try {
            document.removeEventListener('keypress', _spaceBarEscKeyPress);
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not remove play/pause spacebar or esc eventlistener';
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
    function _spaceBarEscKeyPress(event){
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }

        console.log('The keyboard code is ' + code);

        //SpaceBar KeyPress
        if (code === 32 || code === 0) {
            event.preventDefault();
            _playPauseMethod();
        }
        //Esc KeyPress
        if (code === 27) {
            event.preventDefault();
            if(_isFullScreen()){
                that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenExpandIconInnerHtml;
            } else {
                that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenCompressIconInnerHtml;
            }
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
        base64encodedImage = 'data:image/png;base64,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',
        xml2json = new X2JS(),
        defaultSettingsObject = {
            videoWrapperClassName: 'js-' + videoPlayerNameCss + '-container',
            videoWrapperBackgroundColor: '#292c3c',
            videoSplashImageUrl: base64encodedImage,  //'../images/free-video-player-logo-dark.png',
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

        //var className = that._videoWrapper.getAttribute('class');
        //that._videoWrapper.setAttribute('class', className + ' free-video-player-paused');

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
     * @description a fullscreen check method for the public API
     * @returns {boolean}
     * @private
     */
    var _isFullScreen = function() {
        return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    }

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

    /**
     * @description Abort the source buffers
     * @private
     */
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
        currentVideoObject.currentVideoBaseUrl = 'auto';
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
    that.fullscreen = fullscreen;
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





