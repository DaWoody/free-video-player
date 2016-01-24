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

    var that = {
        module:true
    };

    var moduleName = 'Messages',
        moduleVersion = moduleVersion,
        freeVideoPlayerWebUrl = 'http://freevideoplayer.org',
        version = '0.9.0';

    //  #########################
    //  #### MESSAGE METHODS ####
    //  #########################
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
