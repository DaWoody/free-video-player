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

    var that = {},
        settingsObject = settingsObject,
        version = '0.9.0',
        moduleName = 'VIDEO CONTROLS',
        animationDelayObject = {
          videoOverlayFadeOutDelay:100
        },
        videoPlayerNameCss = videoPlayerNameCss,
        messagesModule = freeVideoPlayerModulesNamespace.freeVideoPlayerMessages(settingsObject, version);

    /**
     * @description This methods manipulates the DOM and creates object like subtitle tracks within the DOM
     * aswell as the rest of the control structure, like play/pause button, progress-slider, mute button, volume slider,
     * subtitle selector with sub-menu and fullscreen button
     * @public
     */
    function createVideoControls(videoWrapper, currentVideoObject){

        var videoWrapper = videoWrapper,
            currentControls = videoWrapper.getElementsByTagName('div')[0] || null,
            videoElement = videoWrapper.getElementsByTagName('video')[0] || null,
            volumeHighStart = parseInt(settingsObject.videoControlsVolumeTresholdValues.volumeHighStart, 10),
            volumeLowEnd = parseInt(settingsObject.videoControlsVolumeTresholdValues.volumeLowEnd, 10),
            controlsWrapper = document.createElement('div');
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
            videoWrapper.removeChild(currentControls);
        }

        var playButton = document.createElement('div'),
            volumeIcon = document.createElement('div'),
            subtitlesButton = document.createElement('div'),
            fullScreenButton = document.createElement('div'),
            progressSlider = document.createElement('input'),
            volumeSliderContainer = document.createElement('div'),
            volumeSlider = document.createElement('input'),
            progressTimerContainer = document.createElement('div'),
            progressTimerCurrentTime = document.createElement('span'),
            progressTimerTotalDuration = document.createElement('span'),
            videoOverlayIcon = document.createElement('div');


        //Adding the data to class scoped variable
        that.currentVideoControlsObject.playButton = playButton;
        that.currentVideoControlsObject.volumeIcon = volumeIcon;
        that.currentVideoControlsObject.subtitlesButton = subtitlesButton;
        that.currentVideoControlsObject.fullScreenButton = fullScreenButton;
        that.currentVideoControlsObject.progressSlider = progressSlider;
        that.currentVideoControlsObject.volumeSliderContainer = volumeSliderContainer;
        that.currentVideoControlsObject.volumeSlider = volumeSlider;
        that.currentVideoControlsObject.progressTimerContainer = progressTimerContainer;
        that.currentVideoControlsObject.progressTimerCurrentTime = progressTimerCurrentTime;
        that.currentVideoControlsObject.progressTimerTotalDuration = progressTimerTotalDuration;
        that.currentVideoControlsObject.videoOverlayIcon = videoOverlayIcon;
        that.currentVideoControlsObject.controlsWrapper = controlsWrapper;

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
        subtitlesButton.setAttribute('class', settingsObject.videoControlsCssClasses.subtitlesContainerClass);
        fullScreenButton.setAttribute('class', settingsObject.videoControlsCssClasses.fullscreenContainerClass);
        progressTimerContainer.setAttribute('class', settingsObject.videoControlsCssClasses.progressTimerContainerClass);
        videoOverlayIcon.setAttribute('class', settingsObject.videoControlsCssClasses.videoOverlayIconClass);

        //volumeSliderContainer.setAttribute('style', 'display:none;');
        volumeSlider.setAttribute('type','range');
        volumeSlider.setAttribute('value', 100);
        volumeSlider.setAttribute('orient', 'vertical');
        progressSlider.setAttribute('type','range');
        progressSlider.setAttribute('value', 0);

        playButton.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'playpause');
        volumeIcon.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'mute');
        subtitlesButton.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'subtitles');
        fullScreenButton.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'fullscreen');
        progressTimerContainer.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'progress-timer');
        progressSlider.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'progress');
        volumeSlider.setAttribute('data-' + videoPlayerNameCss + '-control-type', 'volume');

        playButton.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
        volumeIcon.innerHTML = settingsObject.videoControlsInnerHtml.volumeHighIconInnerHtml;
        fullScreenButton.innerHTML = settingsObject.videoControlsInnerHtml.fullscreenExpandIconInnerHtml;
        subtitlesButton.innerHTML = settingsObject.videoControlsInnerHtml.subtitlesMenuInnerHtml;
        progressTimerCurrentTime.innerHTML = '0:00';

        //  #############################
        //  #### ADD EVENT LISTENERS ####
        //  #############################

        videoOverlayIcon.addEventListener('click', _playPauseMethod);

        playButton.addEventListener('click', _playPauseMethod);
        fullScreenButton.addEventListener('click', _fullScreenMethod);

        progressSlider.addEventListener('change', _progressShiftMethod);
        progressSlider.addEventListener('mousedown', _pauseMethodFromSlider);
        progressSlider.addEventListener('mouseup', _playMethodFromSlider);

        progressTimerContainer.appendChild(progressTimerCurrentTime);
        progressTimerContainer.appendChild(progressTimerTotalDuration);

        volumeIcon.addEventListener('click', _volumeMuteUnmuteMethod);
        volumeIcon.addEventListener('mouseover', _showVolumeSlider);
        volumeIcon.addEventListener('mouseout', _hideVolumeSlider);;

        volumeSliderContainer.addEventListener('mouseout', _hideVolumeSlider);

        volumeSlider.addEventListener('change', _volumeShiftMethod);

        //Lets add event listeners to the video element so we can update the progress bar when we need it
        videoElement.addEventListener('loadedmetadata', _printMediaTotalDuration);
        videoElement.addEventListener('timeupdate', _progressUpdateMethod);

        //Lets see if we have subtitles and if that is the case lets add the subtitle menu to the player controls
        var subtitlesMenu = _createSubtitlesMenuAndReturnMenu(videoElement);

        if(subtitlesMenu){
            //Lets add the subtitles menu to the subtitles button
            subtitlesButton.addEventListener('click', function(event){
                subtitlesMenu.style.display = (subtitlesMenu.style.display === 'block' ? 'none' : 'block');
            });
        }

        //  #############################
        //  #### APPEND DOM ELEMENTS ####
        //  #############################
        //Lets add the volume slider to the volume slider container
        volumeSliderContainer.appendChild(volumeSlider);
        currentVideoObject.volumeSliderContainer = volumeSliderContainer;

        if(settingsObject.videoControlsDisplay.showPlayPauseButton){
            controlsWrapper.appendChild(playButton);
        }
        if(settingsObject.videoControlsDisplay.showProgressSlider){
            //Adds both the progress bar and the progress timer container showing current time and the medias
            //total duration
            controlsWrapper.appendChild(progressSlider);
            controlsWrapper.appendChild(progressTimerContainer);
        }
        if(settingsObject.videoControlsDisplay.showVolumeIcon){
            volumeIcon.appendChild(volumeSliderContainer);
            controlsWrapper.appendChild(volumeIcon);
        }
        if(settingsObject.videoControlsDisplay.showVolumeSlider){
            //controlsWrapper.appendChild(volumeSliderContainer);
        }
        if(subtitlesMenu && settingsObject.videoControlsDisplay.showSubtitlesMenu){
            controlsWrapper.appendChild(subtitlesButton);
            controlsWrapper.appendChild(subtitlesMenu);
        }
        if(settingsObject.videoControlsDisplay.showFullScreenButton){
            controlsWrapper.appendChild(fullScreenButton);
        }

        videoWrapper.appendChild(videoOverlayIcon);

        videoWrapper.appendChild(controlsWrapper);

        //Lets now also add keyboard events to
        _createKeyboardListeners();


    };

    //  ##########################
    //  #### CONTROL METHODS ####
    //  ##########################
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

    function _addPlayIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
    };

    function _addPauseIconToControls(){
        that.currentVideoControlsObject.playButton.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
    };

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

    function _pauseMethodFromSlider(){
        that.videoElement.pause();
        _addPlayIconToControls();
    };

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

    function _progressUpdateMethod(){
        var videoDurationInSeconds = that.currentVideoObject.mediaDurationInSeconds,
            currentPosition = that.videoElement.currentTime,
            progressInPercentage = Math.round((currentPosition/videoDurationInSeconds)*100);

            that.currentVideoControlsObject.progressTimerCurrentTime.innerHTML = _returnHoursMinutesSecondsFromSeconds(currentPosition),
            that.currentVideoControlsObject.progressSlider.value = progressInPercentage;
    };

    function _printMediaTotalDuration(){
        //Lets update the media total duration span
        that.currentVideoControlsObject.progressTimerTotalDuration.innerHTML = '/' + _returnHoursMinutesSecondsFromSeconds(that.currentVideoObject.mediaDurationInSeconds);
    };

    function _showVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="visible";
    };

    function _hideVolumeSlider(){
        that.currentVideoControlsObject.volumeSliderContainer.style.visibility="hidden";
    };

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
    function _addPlayIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayIcon.innerHTML = settingsObject.videoControlsInnerHtml.playIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    function _addPauseIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayIcon.innerHTML = settingsObject.videoControlsInnerHtml.pauseIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    function addSpinnerIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
    };

    function removeSpinnerIconToVideoOverlay(){
        _removeCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
        that.currentVideoControlsObject.videoOverlayIcon.innerHTML = settingsObject.videoControlsInnerHtml.spinnerIconInnerHtml;
        _addCssClassToElementAndReturn(that.currentVideoControlsObject.videoOverlayIcon, settingsObject.videoControlsCssClasses.hideVideoOverlayClass);
    };

    //  #####################
    //  #### CSS METHODS ####
    //  #####################
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

    function _removeCssClassToElementAndReturn(element, className){
        var classString = element.getAttribute('class');
        console.log('The className looking for..');
        console.log(className);
        classString = classString.split(className);
        if(classString.length > 0){
            // If we found an instance of the className and split
            // into at least to different parts
            // we should now fetch the first instance
            classString = classString[0].trim();
        } else {
            console.log('className is not here..');
            console.log(className);
        }
        console.log('The new classString is ' + classString);
        element.setAttribute('class', classString);
    };

    //  #########################
    //  #### KEYBOARD EVENTS ####
    //  #########################
    function _createKeyboardListeners(){
        //Add event listener for space button - play/pause
        document.addEventListener('keypress', function(event){
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
        });
    };

    //  ################################
    //  #### CALCULATE TIME METHODS ####
    //  ################################
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
    that.createVideoControls = createVideoControls;
    that.addSpinnerIconToVideoOverlay = addSpinnerIconToVideoOverlay;
    that.removeSpinnerIconToVideoOverlay = removeSpinnerIconToVideoOverlay;
    return that;
};