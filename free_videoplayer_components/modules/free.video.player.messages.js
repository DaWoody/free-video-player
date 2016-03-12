/**
 * @name FREE VIDEO PLAYER - MESSAGES MODULE
 * @module FREE VIDEO PLAYER - MESSAGES MODULE
 * @author Johan Wedfelt
 * @license GPLv3, see  {@link http://www.gnu.org/licenses/gpl-3.0.en.html| http://www.gnu.org/licenses/gpl-3.0.en.html}
 * @description A module containing methods to handle messages being sent to the console, to use with the FREE VIDEO PLAYER library. Check out more @ {@link http://www.freevideoplayer.org| FreeVideoPlayer.org}
 * @param settingsObject {object} - The settingsObject provided when the Free Video Player was instantiated
 * @param moduleVersion {string} - The moduleVersion that Free Video Player uses
 * @returns {{}}
 */
freeVideoPlayerModulesNamespace.freeVideoPlayerMessages = function(settingsObject, moduleVersion){

    'use strict';

    var that = {},
        moduleName = 'MESSAGES',
        isModuleValue = true,
        moduleVersion = moduleVersion,
        freeVideoPlayerWebUrl = 'http://www.freevideoplayer.org';

    //  #########################
    //  #### MESSAGE METHODS ####
    //  #########################
    /**
     * @function
     * @name  printOutErrorMessageToConsole
     * @description A method that generates an error message on the console
     * @param messageObject {object}
     * @param error {error}
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
     * @description A method that generates a message on the console
     * @param messageObject {object}
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

    /**
     * @name printOutLine
     * @description A simple console method to print out a line with a message, could be switched on and off based on a debug parameter when Free Video Player is instantiated.
     * @param message {string} - a message string to print out
     * @public
     */
    function printOutLine(message){
        if(settingsObject.debugMode){
            console.log('Free Video Player - ' + message);
        }
    };

    /**
     * @name printOutWarning
     * @description A simple console method to print out a warning with a message, could be switched on and off based on a debug parameter when Free Video Player is instantiated.
     * @param message {string} - a message string to print out
     * @public
     */
    function printOutWarning(message){
        if(settingsObject.debugMode){
            console.warn('Free Video Player - ' + message);
        }
    };

    /**
     * @name printOutObject
     * @description A simple console method to print out an object with a message, could be switched on and off based on a debug parameter when Free Video Player is instantiated.
     * @param object {object} - the actual object to print out
     * @public
     */
    function printOutObject(object){
        if(settingsObject.debugMode){
            console.log(object);
        }
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
    //Messages
    that.printOutErrorMessageToConsole  = printOutErrorMessageToConsole;
    that.printOutMessageToConsole = printOutMessageToConsole;
    that.printOutLine = printOutLine;
    that.printOutWarning = printOutWarning;
    that.printOutObject = printOutObject;

    //General
    that.getVersion = getVersion;
    that.getName = getName;
    that.isModule = isModule;

    //Return our class/function object
    return that;
};
