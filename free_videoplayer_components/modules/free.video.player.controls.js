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