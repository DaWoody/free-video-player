##Introduction
***
Thank you for downloading and using [Free Video Player](http://www.freevideoplayer.org)!
Free Video Player is an open source project using the [GPLv3 license](http://www.gnu.org/licenses/gpl-3.0.en.html).
The basic idea is to provide a fully functional open source video player which is able to play both regular content video formats (such as mp4, webm, etc)
aswell as adaptive bitrate streaming formats (such as DASH and HLS), based on [HTML5](http://www.w3schools.com/html/html5_video.asp) technologies, both for unencrypted and encrypted content and more.
(Depending on how well the idea is adopted by the community ;)).

There are a number of different video players based on HTML5 technologies both commercial versions (closed source) and some open source,
but most of (if not all) video players claiming to use open source are only using a more narrow license (Apache) which in turn
does not provide full transparency and ensuring that the actual code will remain "free" to the end user as described in http://www.gnu.org/philosophy/philosophy.html.

###Example Page
***
The home of *Free Video Player*, besides here on GitHub, is [www.freevideoplayer.org](http://www.freevideoplayer.org).

##Authors/Contributors
***
Currently there is me, (Johan Wedfelt) doing most of the work on the Free Video Player javascript side. If you find this project cool/interesting
and wanna help, fork the project do some cool things and make a pull-request, or contact me directly and lets create a core-group of developers that
want to make this project better together! :) If you wanna get in contact with us, contact us through GitHub or come and chat with us
through our [HipChat channel](https://www.hipchat.com/gcTxoHaOk)

##Issues / Todo
***
To see a list of todos and current issues, see our issue tracker @
[Issue-section](http://p.freevideoplayer.org/maniphest/query/open/).

##How to build (for developers wanting to contribute)?
***
The project is mainly about the Free Video Player library. Now when the repo is downloaded, run ```npm install``` (you should get even development dependencies)
then you can run either ```npm start``` to run the local web-server instance with a sample-page displaying the Free Video Player,
or you can run the production build with the command ```gulp build```,  which will generate new Free Video Player files within both the *production* folder and the actual
*public* folder (used to display the sample application discussed earlier, which is also shown @ http://www.freevideoplayer.org.
If you just want to build the stylesheet, work on the */free_video_player_components/stylesheet/scss/free.video.player.style.scss* and then run ```gulp watch``` this will generate a sass watcher on your project.

##Installation
***
To use the Free Video Player, you need to include a reference to the source code provided, meaning the javascript files ```free.video.player.full.js``` and
the dependency *xml2json* () which uses the [Apache license](http://www.apache.org/licenses/LICENSE-2.0). This is usually done in the top or the bottom of your html page. An example of how this could be implemented and inserted within
your html, check the *Example of implementation* section below.

Then when the references to the files are there, either within your html within ```<script> ... </script>``` tags or through a
separate javascript file reference, you can instantiate the Free Video Player.
This is done by calling the method ```freeVideoPlayer(optionalConfigurationObject)```. An example of this is provided in the section *Example of implementation* below.

##How to configure the Free Video Player
***
When the Free Video Player is instantiated, it is done so with an optional configuration object. This object in turn contains a set of different 
types of settings that can be used to make the player behave in certain ways. One part of the configuration parameters includes settings for the *Video Controls*.
These *Video Controls* parameters, makes it possible to configure which controls should be displayed, overwrite the inner html of the controls if the default is not
wanted, and also overwrite the classes added to the different controls, both the main control container aswell as the specific controls.
Basically what happens when the default *Video Controls* are added to the player is that a ```div``` element is added as the main container for the *Video Controls*,
then a *play/pause* button, a *progress-slider* ,a *volume-icon*, a *volume-slider* and a *fullscreen-button* is added to the *Video Controls*.

To show some examples of how to configure and overwrite the default values, below is some examples on how to manipulate and change the configuration object
to make the Free Video Player behave as you want.

```javascript

//Some examples of the optional configuration object
//If no configuration object is added on instantiation, the default values will be used
var freeVideoPlayerOptionalConfigurationObject = {
    
                //Add this parameter if you want to change the actual js class name that the Free Video Player uses
                //as a target to instantiate the player, the default value is js-free-video-player-container.
                videoWrapperClassName: 'js-free-video-player-container',
                //This is the default video splash image used on videos if no splash image is provided for the asset
                //when using the load method
                videoSplashImageUrl:'../images/free-video-player-logo.png',
                //This is the url used to fetch the iso-639-1 languages and labels used when the subtitles
                //in streams are added to the DOM and the control structure
                iso6391Url:'/js/freevideoplayer/subtitles/iso-639-1.json',
                
                //This shows the default inner html for the different Video Controls discussed earlier
                //When one of the values are overwritten all is overwritten, so if you want to
                //overwrite the current setup make sure you fill in all values here below to your liking
                videoControlsInnerHtml : {
                    playIconInnerHtml:'<i class="fa fa-play"></i>',
                    pauseIconInnerHtml:'<i class="fa fa-pause"></i>',
                    stopIconInnerHtml:'<i class="fa fa-stop"></i>',
                    volumeHighIconInnerHtml:'<i class="fa fa-volume-up"></i>',
                    volumeLowIconInnerHtml:'<i class="fa fa-volume-down"></i>',
                    novolumeIconInnerHtml:'<i class="fa fa-volume-off"></i>',
                    fullscreenExpandIconInnerHtml:'<i class="fa fa-expand"></i>',
                    fullscreenCompressIconInnerHtml:'<i class="fa fa-compress"></i>',
                    subtitlesMenuInnerHtml:'CC',
                    subtitlesMenuOffButtonInnerHtml:'Off'
                },
                //This object shows the different css classes that are being applied to the different video control
                //elements, and as described above if you want to customize one property all need to be changed or modified
                //since all will be overwritten once one of these sub-properties. The default value for the variable videoPlayerNameCss is free-video-player,
                //so for instance the videoControlsClass would generate the css class: free-video-player-controls
                videoControlsCssClasses: {
                    videoControlsClass: 'free-video-player-controls',
                    videoFullScreenClass: 'free-video-player-controls-fullscreen',
                    playpauseContainerClass: 'free-video-player-controls-playpause',
                    subtitlesContainerClass: 'free-video-player-controls-subtitles',
                    progressbarContainerClass: 'free-video-player-controls-progress',
                    volumeContainerClass: 'free-video-player-controls-volume',
                    fullscreenContainerClass: 'free-video-player-controls-fullscreen',
                    subtitlesMenuClass: 'free-video-player-controls-subtitles-menu',
                    subtitleButtonClass: 'free-video-player-controls-subtitles-button'
                },
                //These sub properties decides which of the video controls that should be generated to the DOM,
                //same procedure as the above properties, if one is changed all need to be added to not make them "undefined"
                //which in turn results in a falsy value and not displaying the rest of the controls that have not been defined.
                videoControlsDisplay: {
                    showPlayPauseButton: true,
                    showProgressSlider: true,
                    showVolumeIcon:true,
                    showVolumeSlider: true,
                    showSubtitlesMenu: true,
                    showFullScreenButton: true
                },
                //Optional values to add percentage values from when the volume icon button should display
                //the icon for full volume, middle volume and no volume.
                videoControlsVolumeTresholdValues: {
                    volumeHighStart:40,
                    volumeLowEnd:10
                },
                //Add this to generate debug messages to the console
                debugMode:true,
                //This parameter decides if the Video Controls should be generated to the DOM
                //if not there is a public API that the Free Video Player also has which can be used 
                //with direct interaction with the instantiated Free Video Player, see the API section
                //for more information.
                createControls:true
            };
};

```

## API
***
There are a number of pulic methods available from the instantiated free video player, most are methods regarding loading media or player control interactions.
Lets list an example of how it could look:

```javascript

//First create an optional configuration object
var freeVideoPlayerOptionalConfigurationObject = {
    //Stuff here..
    //See the section above How to configure the Free Video Player, 
    //to understand more on how to configure the video player.
    ...
};

//Then instantiate the actual player object
var player = freeVideoPlayer(freeVideoPlayerOptionalConfigurationObject);

//Now there are a number of public methods available
//For instance

//load
player.load(videoUrl);

//There are a number of methods that normally
//also are accessible from the Video Controls section that per default is generated by the Free Video Player class
//but these methods can also be accessed directly through the API, methods include things such as play, pause, seek (used by progress-slider), setVolume etc.
//Below we are giving some examples of these API methods.

//play
player.play();

//pause
player.pause();

//seek
player.seek(positionInSeconds);

//set volume
player.setVolume(volumeInNumberFrom0to100);

//get volume
player.getVolume();

//get subtitles array (if you want to elaborate with your own controls
player.getArrayOfSubtitleObjects();


```



##Example of implementation
***

Also in the html of your page a div container with the class ```js-free-video-player-container``` is necessary. Within this class a
video player instance will be created.
Like for instance

```html
<!-- some html.. -->
<html>
<head>
<title>Some title</title>
<!-- Lets add the basic styling for the Free Video Player here, this can ofcourse be overwritten and changed based on your choice of styling -->
<link rel="stylesheet" href="/css/free.video.player.style.css">
<!-- Lets add the source to the different free video player js files that are necessary for running the free video player -->
<script src="/xml2.json.min.js"></script>
<script src="/free.video.player.full.js"></script>
</head>
<body>

    <!-- some html stuff here.. -->
    <div class="js-free-video-player-container optional-other-classes-used-for-styling">
    <!-- here the free video player will be instantiated -->
    </div>

<script>

//Ok so lets instantiate the free video player here..
//First create an optional configuration object
var optionalConfigurationObject = {
    //Add your own configurations here
    //See the section How to configure the Free Video Player, to see more of the possible configuration options
}

//Then instantiate the actual player object
var player = freeVideoPlayer(optionalConfigurationObject);

//Now we can use the player object with regular javascript or libraries such as for instance jQuery/Angular or the
//developers choice
//Like for instance if we have a button or element in the DOM that has an onclick event listener,
//then we could use that to call a method like this..
function someFunctionToPlay(){

       var videoUrl = document.getElementById('some-id-field-value-containing-the-video-url-value').value;

        //Loads the player
        player.load(videUrl);

        //Starts the video..
        player.play();
};


</script>
</body>
</html>

```



