##Version information
***

* Version 0.9.0 - ALPHA
    * Ability to play adaptive VOD content in the form of DASH
    * Aswell as regular VOD content with containers such as MP4 and WEBM
    * Modularized player code into modules - for better code separation and enabling for a future module based system
    * Optional configuration object when instantiating Free Video Player, being able to show/hide specific video controls
    * Ability to alter CSS classes and HTML of video controls being generated
    * The video controls being generated includes support for spacebar working as play/pause button, and enter button acting as toggling between fullscreen mode. The user can exit the fullscreen mode by pressing esc
    * Support in Chrome, Safari, Opera and FireFox
    * For adaptive DASH content, support for multiple bitrates exists
    * For adaptive DASH content, built in adaptive bitrate algorithm for multiple bitrates exists. This is currently based on the download times for each segment
    * For adaptive DASH content, support for subtitles exists, for non-segmented subtitle VTT files, added as a separate adaptionSet within the mpd
    * For adaptive DASH content, support for both separated video and audio tracks, aswell as muxxed (video and audio combined) exists
    * The release comes with a fully documented version (free.video.player.full.js) and a minified version (free.video.player.minified.js), a css file for player styles (free.video.player.style.css), aswell as base files for SCSS (for web-designers/developers wanting to just style the player a bit), a documentation folder including JSDOC based documentation more explicitly describing the Free Video Player API and more, a subtitles folder with a parsed JSON file including information for subtitle labels which Free Video Player per default utilizes if subtitles are found within a DASH stream, and finally the release also contains both a README and a LICENSE file