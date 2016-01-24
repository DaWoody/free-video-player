angular.module('freeVideoPlayerApp')
    .controller('homeController', ['$scope', function($scope){

        //$scope.videoNumbers = senbonaiDataService.videoNumberArray;
        //$scope.randomNumber = Math.ceil((Math.random() * $scope.videoNumbers.length));

        $scope.form = {
            mpdurl:''
        };


        var configObject = {
            //Tested to just display play/pause button
            //        videoControlsDisplay: {
            //            showPlayPauseButton: true
            //        }
        }

        var videoPlayer = freeVideoPlayer(configObject);

        $scope.form.playerVersion = videoPlayer.getVersion();

        $scope.load = function(){
            if($scope.mpdurl !==''){
                console.log('Loading this url' + $scope.form.mpdurl);
                videoPlayer.load($scope.form.mpdurl);
            } else {
                console.log('Did not provide a valid input to load method');
            }

        };

        var ulList = document.getElementById('asset-list'),
            listItemsList = ulList.getElementsByTagName('div');

        for(var i = 0; i < listItemsList.length; i++){
            listItemsList[i].addEventListener('click', function(){
                //var inputField = document.getElementById('add-test-input');
                //inputField.value =  this.innerText;
                var image = this.querySelector('img'),
                    mediaUrl = image.getAttribute('data-video-url');
                videoPlayer.load(mediaUrl);
            });
        }

        //Lets start the video player by loading an example of Big Buck Bunny when the page is loaded
        videoPlayer.load('/test/localNonAdaptiveStreams/big_buck_bunny.mp4');

    }]);