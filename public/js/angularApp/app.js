/**
 * A basic Angular App to demonstrate a landing page for Free Video Player
 * see more @ http://www.freevideoplayer.org
 */
angular.module('freeVideoPlayerApp', ['ngResource', 'ngRoute'])
    .config(function($routeProvider){
        $routeProvider

            .when('/home', {
                templateUrl:'templates/pages/home.html',
                controller:'homeController'
            })
            .when('/about', {
                templateUrl:'templates/pages/about.html',
                controller:'aboutController'
            })
            .when('/installing', {
                templateUrl:'templates/pages/installing.html',
                controller:'installingController'
            })
            .when('/contribute', {
                templateUrl:'templates/pages/contribute.html',
                controller:'contributeController'
            })
            .when('/contact', {
                templateUrl:'templates/pages/contact.html',
                controller:'contactController'
            })
            .when('/download', {
                templateUrl:'templates/pages/download.html',
                controller:'downloadController'
            })

            .otherwise({redirectTo: '/home'});


        //Some stuff here..
    });
