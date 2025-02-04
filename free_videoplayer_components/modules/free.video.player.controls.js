/**
 * @name FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
 * @module FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A  module handling creation and updating of video controls for the Free Video Player, to use with the FREE VIDEO PLAYER library. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param videoPlayerNameCss {string} - The css name for the Free Video Player as it got instantiated,
 * @param messageModule {object} - The instantiated messages module
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerControls = function(settingsObject, videoPlayerNameCss, messagesModule){
    'use strict';

    /**
     * Lets instantiate the different variables we will be needing when we start up this controls module
     */
    var that = {},
        settingsObject = settingsObject,
        isModuleValue = true,
        moduleVersion = '0.9.0',
        moduleName = 'VIDEO CONTROLS',
        animationDelayObject = {
          videoOverlayFadeOutDelay:100
        },
        videoPlayerNameCss = videoPlayerNameCss,
        messagesModule = messagesModule || freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, moduleVersion),
        videoControlsKeyboardCodes = new Map();

    /**
     * @function
     * @name createVideoControls
     * @description This methods manipulates the DOM and creates object like subtitle tracks within the DOM
     * aswell as the rest of the control structure, like play/pause button, progress-slider, mute button, volume slider,
     * subtitle selector with sub-menu and fullscreen button
     * @param {element} videoWrapper - The DOM element for the videoWrapper
     * @param {element} currentVideoObject - The DOM video element
     * @public
     */
    function createVideoControls(videoWrapper, currentVideoObject){

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

        currentVideoObject._isPlaying = false;

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
            progressBarBuffered = document.createElement('div'),
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
        that.currentVideoControlsObject.progressBarBuffered = progressBarBuffered;
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
        progressBarBuffered.setAttribute('class', settingsObject.videoControlsCssClasses.progressBarBufferedClass);
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
        progressSlider.setAttribute('type','range');
        progressSlider.setAttribute('value', 0);

        progressBarBuffered.setAttribute('role', 'progressbar');
        progressBarBuffered.setAttribute('aria-valuenow', 0);
        progressBarBuffered.setAttribute('aria-valumin', 0);
        progressBarBuffered.setAttribute('aria-valumax', 100);
        progressBarBuffered.setAttribute('style', 'width:0%;');


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
        progressSlider.addEventListener('mousedown', _pauseUpdateProgressBar);
        progressSlider.addEventListener('mouseup', _continueUpdateProgressBar);

        volumeIcon.addEventListener('click', _volumeMuteUnmuteMethod);
        volumeIcon.addEventListener('mouseover', _showVolumeSlider);
        volumeIcon.addEventListener('mouseout', _hideVolumeSlider);

        volumeSliderContainer.addEventListener('mouseout', _hideVolumeSlider);
        volumeSlider.addEventListener('change', _volumeShiftMethod);

        settingsIcon.addEventListener('click', _changeSettings);

        //Lets add event listeners to the video element so we can update the progress bar when we need it
        videoElement.addEventListener('loadstart', addSpinnerIconToVideoOverlay);
        videoElement.addEventListener('canplay', removeSpinnerIconFromVideoOverlay);

        videoElement.addEventListener('loadedmetadata', _printMediaTotalDuration);
        videoElement.addEventListener('timeupdate', _progressUpdateMethod);

        //Lets add the subtitles after the loadeddata has been reached.
        videoElement.addEventListener('loadeddata', function(){
            var subtitlesMenu = _createSubtitlesMenuAndReturnMenu(videoElement);

            if(subtitlesMenu
                && settingsObject.videoControlsDisplay.showSubtitlesMenu){
                subtitlesContainer.appendChild(subtitlesMenu);
                settingsMenu.appendChild(subtitlesContainer);
            }
        });

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
            controlsWrapper.appendChild(progressBarBuffered);
            controlsWrapper.appendChild(progressSlider);
        }

        if(settingsObject.videoControlsDisplay.showPlayPauseButton){
            controlsWrapper.appendChild(playButton);
        }

        if(settingsObject.videoControlsDisplay.showVolumeIcon){
            volumeIcon.appendChild(volumeSliderContainer);
            controlsWrapper.appendChild(volumeIcon);
        }

        if(settingsObject.videoControlsDisplay.showSettingsIcon){
            controlsWrapper.appendChild(settingsIcon);
            controlsWrapper.appendChild(settingsMenu);
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

        //Add stuff to the videoWrapper
        videoWrapper.appendChild(videoOverlaySpinnerIcon);
        videoWrapper.appendChild(videoOverlayPlayPauseIcon);
        videoWrapper.appendChild(controlsWrapper);

        //Lets now also add keyboard events to
        //the different buttons we want our player to interact with from the keyboard.
        _createKeyboardListeners();
    };

    /**
     * @function
     * @name updateProgressBarWithBufferedData
     * @description A public method accessible to the adaptive streaming module, so the adaptive streaming methods or a regular load non adaptive content method (from the Free Video Player main class), can fire and update how much buffering of the progress bar has been done.
     * @param bufferedStart {number} - When buffering started (usually at 0, for VOD etc)
     * @param bufferedEnd {number} - How much has been buffered so far
     * @param totalDurationInSeconds {string | number} - The total duration of the media
     * @public
     */
    function updateProgressBarWithBufferedData(bufferedStart, bufferedEnd, totalDurationInSeconds){

        //lets update the progressBar in the Dom with buffered data
        var progressBar = that.currentVideoControlsObject.progressBarBuffered,
            bufferedStartRound = Math.round(bufferedStart),
            bufferedEndRound = Math.round(bufferedEnd),
            totalBuffered = bufferedEnd - bufferedStart,
            totalDurationAsNumber = parseInt(totalDurationInSeconds, 10),
            totalBufferedInPercent = Math.round((totalBuffered / totalDurationAsNumber) * 100) > 100 ? 100 : Math.round((totalBuffered / totalDurationAsNumber) * 100);


        that.currentVideoControlsObject.progressBarBuffered.setAttribute('style', 'width:' + totalBufferedInPercent + '%;');
        that.currentVideoControlsObject.progressBarBuffered.setAttribute('aria-valuenow', totalBufferedInPercent);
    };

    /**
     * @function
     * @name _addAndReturnVideoFormatName
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
     * @function
     * @name addBitrateMenuToSettingsIcon
     * @description A method that in turn will modify the settingsMenu on videoControls to correspond
     * to different choices the user has to decide which quality the video should be streamed at.
     * @param {string} typeOfStream - The type of stream, like dash, hls, mp4 and more
     * @param {array} bitrateObjectsArray - An array of bitrate objects
     * @public
     */
    function addBitrateMenuToSettingsIcon(typeOfStream, bitrateObjectsArray){

        messagesModule.printOutLine('_addBitrateMenuToSettingsIcon - The stream is..' + typeOfStream);

        if(typeOfStream !== 'audio'){
            //Should be video or videoAndAudio stream now
            var bitrateMenuContainer = document.createElement('div'),
                bitrateMenu = document.createElement('select'),
                bitrateObjectArrayLength = bitrateObjectsArray.length;

            //Add classes and html to the actual bit
            bitrateMenuContainer.innerHTML = settingsObject.videoControlsInnerHtml.bitrateQualityMenuInnerHtml;
            bitrateMenuContainer.setAttribute('class', settingsObject.videoControlsCssClasses.bitrateQualityMenuContainerClass);
            bitrateMenuContainer.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'quality');

            bitrateMenu.setAttribute('class', settingsObject.videoControlsCssClasses.bitrateQualityMenuClass);

            for(var i = 0; i < bitrateObjectArrayLength; i++){
                var bitrateItem = document.createElement('option');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-index', bitrateObjectsArray[i].bandwidthIndex);
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url', bitrateObjectsArray[i].baseUrl);
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
                bitrateItem.innerHTML = bitrateObjectsArray[i].height + 'p';
                bitrateMenu.insertBefore(bitrateItem, bitrateMenu.firstChild);
            }

            //Lets add an auto option here
            if(bitrateObjectArrayLength > 0){
                //Lets create the auto option last
                var bitrateItem = document.createElement('option');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-index', 'auto');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url', 'auto');
                bitrateItem.setAttribute('data-' + videoPlayerNameCss + '-state', 'active');
                bitrateItem.setAttribute('selected', 'selected');
                bitrateItem.innerHTML = 'auto';
                bitrateMenu.appendChild(bitrateItem);
            }

            bitrateMenu.addEventListener('change', _changeVideoBitrate);
            bitrateMenuContainer.appendChild(bitrateMenu);
            that.currentVideoControlsObject.settingsMenu.appendChild(bitrateMenuContainer);
        }
    };


    /**
     * @function
     * @name _changeVideoBitrate
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * @description A method that both updates the DOM in the Video Controls section with attributes to the selected and non selcted bitrates (so it can be used for styling) and also setting a class scoped variable that can be used when switching bitrate
     * @private
     */
    function _changeVideoBitrate(){
        var selectedOption = this.options[this.selectedIndex];

        var elementTagName = selectedOption.nodeName,
            baseUrl = selectedOption.getAttribute('data-' + videoPlayerNameCss + '-bitrate-base-url'),
            listElement = selectedOption.parentNode,
            listElements = listElement.getElementsByTagName(elementTagName);

        for(var i = 0, listLength = listElements.length; i < listLength; i++ ){
            //Lets reset all items to be not selected
            listElements[i].setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
        }
        //Lets set this current item to be active
        selectedOption.setAttribute('data-' + videoPlayerNameCss + '-state', 'active');

        //Now lets also save the baseUrl we fetched from the DOM node
        that.currentVideoObject.streamObject.currentVideoBaseUrl = baseUrl;
        _changeSettings();
    };

    //  ##########################
    //  #### CONTROL METHODS ####
    //  ##########################
    /**
     * @function
     * @name _playPauseMethod
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * @description This method makes the video play or pause depending on its current state,
     * will also paint out different states in the DOM both for the controls and the videoOverlay
     * @private
     */
    function _playPauseMethod(){
        if(!that.currentVideoObject._isPlaying){
            that.videoElement.play();
            _addPauseIconToControls();
            _addPlayIconToVideoOverlay();
            that.currentVideoObject._isPlaying = true;

        } else {
            that.videoElement.pause();
            _addPlayIconToControls();
            _addPauseIconToVideoOverlay();
            that.currentVideoObject._isPlaying = false;
        }
    };

    /**
     * @function
     * @name _addPlayIconToControls
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * @description Adds a play icon to the controls
     * @private
     */
    function _addPlayIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
    };

    /**
     * @function
     * @name _addPauseIconToControls
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * Adds a pause icon to the controls
     * @private
     */
    function _addPauseIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
    };


    /**
     * @function
     * @name _pauseUpdateProgressBar
     * @private
     */
    function _pauseUpdateProgressBar(){
        that.currentVideoObject._isPlaying = false;
    };

    /**
     * @function
     * @name _continueUpdateProgressBar
     * @private
     */
    function _continueUpdateProgressBar(){
        that.currentVideoObject._isPlaying = true;
    };

    /**
     * @function
     * @name _volumeShiftMethod
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * @description A method to shift the volume up and down
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
     * @function
     * @name _volumeMuteUnmuteMethod
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
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
     * @function
     * @name _progressShiftMethod
     * @memberof FREE VIDEO PLAYER - VIDEO CONTROLS MODULE
     * @description A method to shift to a new position within the videoElement, basically seeking to a new position and
     * also updating the controls as we do this
     * @private
     */
    function _progressShiftMethod(){

        //First get the total value of the asset.
        var videoDurationInSeconds = that.currentVideoObject.mediaDurationInSeconds,
            newPosition = Math.floor((that.currentVideoControlsObject.progressSlider.value/100)*videoDurationInSeconds);

        //Seek to new position
        if(that.currentVideoObject._isPlaying){
            that.videoElement.currentTime = newPosition;
        }
    };

    /**
     * @name _progressUpdateMethod
     * @description A method that can be called continuasly to update the progress bar of the current video position.
     * @private
     */
    function _progressUpdateMethod(){
        if(that.currentVideoObject._isPlaying){
            var videoDurationInSeconds = that.currentVideoObject.mediaDurationInSeconds,
                currentPosition = that.videoElement.currentTime,
                progressInPercentage = Math.round((currentPosition/videoDurationInSeconds)*100);

            that.currentVideoControlsObject.progressTimerCurrentTime.innerHTML = _returnHoursMinutesSecondsFromSeconds(currentPosition),
            that.currentVideoControlsObject.progressSlider.value = progressInPercentage;
        }
    };

    /**
     * @name _printMediaTotalDuration
     * @description A method that can be called to print the total media duration of an asset
     * @private
     */
    function _printMediaTotalDuration(){
        //Lets update the media total duration span
        that.currentVideoControlsObject.progressTimerTotalDuration.innerHTML = '/' + _returnHoursMinutesSecondsFromSeconds(that.currentVideoObject.mediaDurationInSeconds);
    };

    /**
     * @name _showVolumeSlider
     * @description A method will make the volume slider visible
     * @private
     */
    function _showVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="visible";
    };

    /**
     * @name _hideVolumeSlider
     * @description A method that will make the volume slider not visible
     * @private
     */
    function _hideVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="hidden";
    };

    /**
     * @name _changeSettings
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
     * @name _fullScreenMethod
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
     * @name  _isFullScreen
     * @description Checks if the browsers is in full-screen mode
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
     * @name _addPlayIconToVideoOverlay
     * @description A method that adds a play icon to the video overlay
     * @private
     */
    function _addPlayIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    /**
     * @name _addPauseIconToVideoOverlay
     * @description A method that adds a pause icon to the video overlay
     * @private
     */
    function _addPauseIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };


    /**
     * @function
     * @name addSpinnerIconToVideoOverlay
     * @description A method that adds a spinner icon to the video overlay
     * @public
     */
    function addSpinnerIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
    };

    /**
     * @function
     * @name removeSpinnerIconFromVideoOverlay
     * @description A method that removes a spinner icon from the video overlay
     * @public
     */
    function removeSpinnerIconFromVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayPlayPauseIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayPlayPauseIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    //  #####################
    //  #### CSS METHODS ####
    //  #####################
    /**
     * @name _addCssClassToElementAndReturn
     * @description A method that adds a css class to an an element
     * @param element {element} - The element which should get the css class added
     * @param className {string} - The classname
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
                messageObject.moduleVersion = moduleVersion;
                messageObject.isModule = isModuleValue;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    /**
     * @name _removeCssClassToElementAndReturn
     * @description A method that removes a css class from an an element
     * @param element {element}
     * @param className {string}
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
        }
        element.setAttribute('class', classString);
    };

    /**
     * @name _checkIfElementHasCssClassReturnBoolean
     * @description A utility method meant to be able to filter between css classes, and if an element has the class
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
     * @name _createKeyboardListeners
     * @description A method that aggregates the methods that will add keyboard eventListeners to the Free Video Player
     * @private
     */
    function _createKeyboardListeners(){
        //Lets first add the codes for the different buttons
        _addKeyboardShortCodes();
        // Add event listener for different key press situations,
        // like space button - play/pause
        _createKeyPressListener();
        _createFullscreenListener();
    };

    /**
     * @name _removeKeyboardListeners
     * @description An overall method to remove eventListeners connected to the keyboard, if say a previous asset was loaded and
     * a new one is loaded.
     * @private
     */
    function _removeKeyboardListeners(){
        //Remove key listeners
        _removeKeyPressListener();
        _removeFullscreenListener();
    };

    /**
     * @name _createPlayPauseSpaceBarListener
     * @description A method that enables to play/pause from the keyboard spacebar.
     * @private
     */
    function _createKeyPressListener(){
        document.addEventListener('keydown', _keyPress);
    };

    /**
     * @name _createFullscreenListener
     * @description A method hooking on event listeners to the fullscreenchange event, also for vendor/browser specific events
     * @private
     */
    function _createFullscreenListener(){
        document.addEventListener('webkitfullscreenchange', _contractExpandFullscreenIcon);
        document.addEventListener('mozfullscreenchange', _contractExpandFullscreenIcon);
        document.addEventListener('msfullscreenchange', _contractExpandFullscreenIcon);
        document.addEventListener('fullscreenchange', _contractExpandFullscreenIcon);
    };

    /**
     * @name _removeFullscreenListener
     * @description A method to remove the previously hooked up events for the fullscreenchange events
     * @private
     */
    function _removeFullscreenListener(){
        document.removeEventListener('webkitfullscreenchange', _contractExpandFullscreenIcon);
        document.removeEventListener('mozfullscreenchange', _contractExpandFullscreenIcon);
        document.removeEventListener('msfullscreenchange', _contractExpandFullscreenIcon);
        document.removeEventListener('fullscreenchange', _contractExpandFullscreenIcon);
    };

    /**
     * @description The method that removes the play/pause button from the spacebar.
     * @private
     */
    function _removeKeyPressListener(){
        try {
            document.removeEventListener('keydown', _keyPress);
        } catch(e){
            var messageObject = {};
                messageObject.message = 'Could not remove play/pause spacebar or esc eventlistener';
                messageObject.methodName = '_removePlayPauseSpaceBarListener';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
                messageObject.isModule = isModuleValue;
            messagesModule.printOutMessageToConsole(messageObject);
        }
    };

    /**
     * @description The actual method that catches the event from the spacebar button
     * @param event
     * @private
     */
    function _keyPress(event){
        var code = event.keyCode ? event.keyCode : event.which;
        //messagesModule.printOutLine('The keyboard code is ' + code);
        //SpaceBar KeyPress
        if (code === videoControlsKeyboardCodes.get('spacebar')) {
            event.preventDefault();
            _playPauseMethod();
        }

        if (code === videoControlsKeyboardCodes.get('enter')) {
            event.preventDefault();
            _fullScreenMethod();
        }
    };

    /**
     * @name _contractFullscreenIcon
     * @description A Helper function to modify the GUI of the Video Controls if the user is in fullscreen mode and decides to exit the mode by pressing ESC
     * @private
     */
    function _contractExpandFullscreenIcon(){
        if(_isFullScreen()){
            that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenCompressIconInnerHtml;
        } else {
            that.currentVideoControlsObject.fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenExpandIconInnerHtml;
        }
    };

    /**
     * @name _addKeyboardShortCodes
     * @description A method to add the different keyboard codes to common module map object
     * @private
     */
    function _addKeyboardShortCodes(){
        videoControlsKeyboardCodes.set('spacebar', 32);
        videoControlsKeyboardCodes.set('esc', 27);
        videoControlsKeyboardCodes.set('leftArrow', 37);
        videoControlsKeyboardCodes.set('rightArray', 39);
        videoControlsKeyboardCodes.set('enter', 13);
    };

    //  ################################
    //  #### CALCULATE TIME METHODS ####
    //  ################################
    /**
     * A method that calculates and returns a Hours Minutes and Seconds string from Seconds
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
                    messageObject.moduleVersion = moduleVersion;
                    messageObject.isModule = isModuleValue;
                messagesModule.printOutErrorMessageToConsole(messageObject, e);
            }
        return returnHourMinutesSeconds;
    };

    //  ################################
    //  #### BITRATE METHODS / DOM ####
    //  ################################
    /**
     * Creates a bitrate menu and returns that menu
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

                //Since we are setting the language to a value here, this subtitle button will appear
                //as a choice in the menu, with label name set to the subtitlesMenuOffButtonInnerHtml,
                //and this button will act as a deactivator
                createBitrateMenuItemConfigObject = {
                    bitrateName: 'auto',
                    bitrateIndex: 0
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
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return bitrateMenu;
    };

    //  ################################
    //  #### SUBTITLE METHODS / DOM ####
    //  ################################
    /**
     * Creates a subtitle menu and returns that menu
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
                subtitlesMenu = documentFragment.appendChild(document.createElement('select'));
                subtitlesMenu.className =  settingsObject.videoControlsCssClasses.subtitlesMenuClass;
                that.currentVideoObject.subtitlesMenu = subtitlesMenu;
                that.currentVideoObject.textTracks = videoElement.textTracks;

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
                subtitlesMenu.addEventListener('change', _changeSubtitle);
            }
        } catch(e){

            var messageObject = {};
                messageObject.message = 'Could not create a subtitles menu and return the menu';
                messageObject.methodName = '_createSubtitlesMenuAndReturnMenu';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
                messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return subtitlesMenu;
    };

    /**
     * @name _changeSubtitle
     * @description A private method for changing/switching between subtitles
     * @private
     */
    function _changeSubtitle(){

        var subtitlesMenu = that.currentVideoObject.subtitlesMenu,
            subtitlesMenuButtonsArray = subtitlesMenu.children,
            textTracks = that.currentVideoObject.textTracks;

        for(var j = 0, subtitleMenuLength = subtitlesMenuButtonsArray.length; j < subtitleMenuLength; j++){
            subtitlesMenuButtonsArray[j].setAttribute('data-' + videoPlayerNameCss + '-state', 'inactive');
        }

        //Lets first deactive all subtitles, setting this on the buttons so they can be styled
        for(var i = 0, textTracksLength = textTracks.length; i < textTracksLength; i++){
            if(textTracks[i].label === this.options[this.selectedIndex].text){
                textTracks[i].mode = 'showing';
                this.options[this.selectedIndex].setAttribute('data-' + videoPlayerNameCss + '-state', 'active');
            } else {
                textTracks[i].mode = 'hidden';
            }
            _changeSettings();
        }
    };

    /**
     * Creates a subtitle menu item. This will be added to the subtitle menu
     * @param configObject
     * @returns {Node}
     */
    function _createSubtitlesMenuItem(configObject){

        var language = configObject.language,
            label = configObject.label,
            videoElement = configObject.videoElement,
            textTracks = videoElement.textTracks;

        var button = document.createElement('option');

        //button.setAttribute('id', id);
        button.className = settingsObject.videoControlsCssClasses.subtitleButtonClass;
        if(language.length > 0){
            //For the empty subtitles track
            button.setAttribute('lang', language);
            button.value = label;
            button.innerHTML = label;
            button.setAttribute('data-' + videoPlayerNameCss + '-state' , 'inactive');
        }
        return button;
    };

    /**
     * @function
     * @name addSubtitlesTracksToDom
     * @description Adds subtitles tracks to the DOM and the video player instance within the video element
     * @param {array} subtitleTracksArray - An array of subtitles
     * @param {element} videoElement - The video element <video></video>
     * @public
     */
    function addSubtitlesTracksToDom(subtitleTracksArray , videoWrapper){
        var videoElement = videoWrapper.getElementsByTagName('video')[0];

            subtitleTracksArray.forEach(function(currentSubtitleTrack, index, subtitleTracksArray){
                //Lets create a track object and append it to the video element
                var trackElement = document.createElement('track'),
                    subtitleLabel = '';

                trackElement.setAttribute('kind', 'subtitles');
                trackElement.setAttribute('src', currentSubtitleTrack.subtitleUrl);
                trackElement.setAttribute('srclang', currentSubtitleTrack.subtitleLanguage);

                subtitleLabel = _returnFirstWordFromSubtitleLabel(currentSubtitleTrack.subtitleLabel);
                subtitleLabel =  _returnSubtitleLabelSmallLetters(subtitleLabel);

                //_returnSubtitleLabelCapitalized(subtitleLabel);
                trackElement.setAttribute('label', subtitleLabel);
                trackElement.setAttribute('data-' + videoPlayerNameCss + '-subtitle-index', index+1);
                trackElement.setAttribute('data-' + videoPlayerNameCss + '-period-index', currentSubtitleTrack.periodIndex);
                videoElement.appendChild(trackElement);
            });
    };

    /**
     * Helper method that returns the first word from the subtitle label in case the subtitle label
     * contains multiple words
     * @private
     * @param {string} subtitleLabel
     * @returns {*}
     */
    function _returnFirstWordFromSubtitleLabel(subtitleLabel){
        var modifiedSubtitleLabel = subtitleLabel;
        try {
            modifiedSubtitleLabel = modifiedSubtitleLabel.split(',')[0];
        } catch (e){
            var messageObject = {};
                messageObject.message = 'Could not parse through the subtitle label and return the first word';
                messageObject.methodName = '_returnFirstWordFromSubtitleLabel';
                messageObject.moduleName = moduleName;
                messageObject.moduleVersion = moduleVersion;
                messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return modifiedSubtitleLabel;
    };

    /**
     * Returns the subtitle label capitalized, like for instance Label instead of label.
     * @private
     * @param {string} subtitleLabel
     * @returns {*}
     */
    function _returnSubtitleLabelCapitalized(subtitleLabel){
        var modifiedSubtitleLabel = subtitleLabel;
        try {
            modifiedSubtitleLabel.trim();
            modifiedSubtitleLabel = modifiedSubtitleLabel.charAt(0).toUpperCase() + modifiedSubtitleLabel.slice(1);
        } catch (e){
            var messageObject = {};
            messageObject.message = 'Could not parse and Capitalize the subtitle label';
            messageObject.methodName = '_returnSubtitleLabelCapitalized';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return modifiedSubtitleLabel;
    };

    /**
     * Returns the subtitle label in small letters, like for instance label instead of Label.
     * @private
     * @param {string} subtitleLabel
     * @returns {*}
     */
    function _returnSubtitleLabelSmallLetters(subtitleLabel){
        var modifiedSubtitleLabel = subtitleLabel;
        try {
            modifiedSubtitleLabel.trim();
            modifiedSubtitleLabel = modifiedSubtitleLabel.charAt(0).toLowerCase() + modifiedSubtitleLabel.slice(1);
        } catch (e){
            var messageObject = {};
            messageObject.message = 'Could not parse and smallify the subtitle label';
            messageObject.methodName = '_returnSubtitleLabelSmallLetters';
            messageObject.moduleName = moduleName;
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return modifiedSubtitleLabel;
    };



    /**
     * @function
     * @name returnModifiedArrayOfSubtitlesWithLabel
     * @description This method returns a modified array of subtitle objects with labels,
     * so the subtitle objects can be used to populate the DOM structure and such.
     * @public
     * @param {array} arrayOfSubtitles - An array of subitles
     * @param {array} arrayOfLanguageObjects - An array of language objects
     * @returns {array} - An array of subtitle objects including labels within the objects
     */
    function returnModifiedArrayOfSubtitlesWithLabel(arrayOfSubtitles, arrayOfLanguageObjects){

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
            messageObject.moduleVersion = moduleVersion;
            messageObject.isModule = isModuleValue;
            messagesModule.printOutErrorMessageToConsole(messageObject, e);
        }
        return arrayOfSubtitles;
    };

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
    //Controls
    that.createVideoControls = createVideoControls;
    that.updateProgressBarWithBufferedData = updateProgressBarWithBufferedData;

    //Subtitle methods
    that.addSubtitlesTracksToDom = addSubtitlesTracksToDom;
    that.returnModifiedArrayOfSubtitlesWithLabel = returnModifiedArrayOfSubtitlesWithLabel;

    //Spinner methods
    that.addSpinnerIconToVideoOverlay = addSpinnerIconToVideoOverlay;
    that.removeSpinnerIconFromVideoOverlay = removeSpinnerIconFromVideoOverlay;

    //Bitrate method, used by adaptive streaming module/player
    that.addBitrateMenuToSettingsIcon = addBitrateMenuToSettingsIcon;

    //General methods
    that.getName = getName;
    that.getVersion = getVersion;
    that.isModule = isModule;

    //Return our controls object
    return that;
};