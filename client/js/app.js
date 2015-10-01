console.log('app.js loaded');

angular.module('MindlogMaster', ['ngCookies']);

angular.module('MindlogMaster')
    .controller('UsersController', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){
        $scope.welcome = "The basic tool for the manipulation of reality is the manipulation of words.";
        $scope.users = [];
        $scope.newUser = {};
        $scope.loginUser = {};
        $scope.newMindlog = {};

        $scope.getUsers = function(){
            $http.get('/api/users').then(function(response){
                $scope.users = response.data;
            });
        };
        $scope.getUsers();

        $scope.createUser = function(){
            $http.post('/api/users', $scope.newUser).then(function(response){
                $scope.users.push(response.data);
                $scope.newUser = {};
            });
        };

        $scope.createMindlog = function(){
            $http({
                url: '/api/mindlogs',
                method: 'post',
                headers: {
                    token: $scope.token
                },
                    data: $scope.newMindlog
            }).then(function(response){
                console.log(response.data);
            });
        };

        $scope.obtainToken = function(){
            $http.post("/api/users/authentication_token", $scope.loginUser).then(function(response){
                $scope.token = response.data.token;
                $cookies.put('token', $scope.token);
            });
        };

        $scope.token = $cookies.get('token');


    }]);

// angular.module('MindlogManager')
//     .controller('MindlogsController', ['$scope', '$http', function($scope, $http){
//
//         $scope.mindlogs = [];
//         $scope.newMindlog = {};
//
//         $scope.getMindlog = function(){
//             $http.get('/api/mindlogs').then(function(response){
//                 $scope.mindlogs = response.data;
//             });
//         };
//
//
//         $http.get('/api/mindlogs').then(function(response){
//             $scope.mindlogs = response.data;
//         });
//
//         $scope.createMindlog = function(){
//             $http.post('/api/mindlogs', $scope.newMindlog).then(function(response){
//                 $scope.mindlogs.push(response.data);
//             });
//
//         };
//
//         $scope.removeMindlog = function(mindlog){
//             var url = '/api/mindlogs/' + mindlog._id;
//             $http.delete(url).then(function(response){
//                 $scope.getMindlog();
//
//             });
//         };
//
//     }]);
