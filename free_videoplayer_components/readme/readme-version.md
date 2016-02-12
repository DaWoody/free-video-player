##Version information
***

- version 0.9.0 - (COMING SOON) The first ALPHA release of Free Video Player. This release include things as:
    - Ability to play adaptive bitrated DASHed content, muxxed (audio/video) and separated content (audio and video). The two first versions of DASH structures aimed to work are:
        - urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash264
        - Another.. profile here.. (can't find it currently ;)).
    - Ability to play basica formats such as ```mp4, webm```.
    - Creating video player controls with ```play/pause```, ```progress-slider```, ```progress-timer```, ```volume-slider```, ```settings-menu``` **(with possibility to change quality and subtitles if they exist)** and ```fullscreen``` functionality.
    - Utilizing the *Media Source Extension* module to make playback available with the player.
    - Styling video control structure, with information on which video controls to paint to the DOM, the inner html of 
 the video control element and the corresponding css class (for styling).
