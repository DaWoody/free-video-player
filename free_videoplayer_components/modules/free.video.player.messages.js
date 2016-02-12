/**
 * @name FREE VIDEO PLAYER - MESSAGES MODULE
 * @namespace FREE VIDEO PLAYER - MESSAGES MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A cool FREE VIDEO PLAYER library to use when want to play DASHed content, Requires the xml2json library to work. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @description A messages module to use with for example FREE VIDEO PLAYER library.
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param moduleVersion {string} - The moduleVersion that Free Video Player uses
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerMessages = function(settingsObject, moduleVersion){

    'use strict';

    var that = {},
        moduleName = 'MESSAGES',
        moduleVersion = moduleVersion,
        freeVideoPlayerWebUrl = 'http://www.freevideoplayer.org';

    //Indicate that the returned object is a module
    that._isModule = true;

    //  #########################
    //  #### MESSAGE METHODS ####
    //  #########################
    /**
     * @function
     * @name  printOutErrorMessageToConsole
     * @memberof FREE VIDEO PLAYER - MESSAGES MODULE
     * @description A method that generates an error message on the console
     * @param messageObject
     * @param error
     * @public
     */
    function printOutErrorMessageToConsole(messageObject, error){

        var consoleMessage = '',
            message = messageObject.message,
            methodName = messageObject.methodName,
            moduleName = messageObject.moduleName,
            moduleVersion = messageObject.moduleVersion;

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
     * @function
     * @name  printOutMessageToConsole
     * @memberof FREE VIDEO PLAYER - MESSAGES MODULE
     * @description A method that generates a message on the console
     * @param messageObject
     * @public
     */
    function printOutMessageToConsole(messageObject){

        var consoleMessage = '',
            message = messageObject.message,
            methodName = messageObject.methodName,
            moduleName = messageObject.moduleName,
            moduleVersion = messageObject.moduleVersion;

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

    //  #########################
    //  #### GENERAL METHODS ####
    //  #########################
    /**
     * @function
     * @name  getModuleVersion
     * @memberof FREE VIDEO PLAYER - MESSAGES MODULE
     * @description A method that gets the module version
     * @public
     */
    function getModuleVersion(){
        return moduleVersion;
    };

    /**
     * @function
     * @name  getModuleVersion
     * @memberof FREE VIDEO PLAYER - MESSAGES MODULE
     * @description A method that gets the module name
     * @public
     */
    function getModuleName(){
        return moduleName;
    };

    //  #############################
    //  #### MAKE METHODS PUBLIC ####
    //  #############################
    //Messages
    that.printOutErrorMessageToConsole  = printOutErrorMessageToConsole;
    that.printOutMessageToConsole = printOutMessageToConsole;

    //General
    that.getModuleVersion = getModuleVersion;
    that.getModuleName = getModuleName;

    //Indicate that the returned object is a module
    that._isModule = true;

    //Return our class/function object
    return that;
};
