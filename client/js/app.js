console.log('app.js loaded');

var myApp = angular.module('MindlogMaster', ['ngCookies', 'ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/login");
    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "/html/partials/login.html",
            controller: 'UsersController'
        })
        .state('profile', {
            url: "/profile",
            templateUrl: "/html/partials/profile.html",
            controller: 'GraphController'
        })

});



angular.module('MindlogMaster')
    .controller('UsersController', ['$scope', '$http', '$cookies', '$state', function($scope, $http, $cookies, $state){
        $scope.welcome = "log your mind.";
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



        $scope.obtainToken = function(){
            $http.post("/api/users/authentication_token", $scope.loginUser).then(function(response){
                $scope.token = response.data.token;
                $cookies.put('token', $scope.token);
                $state.go("profile")
            });
        };

        $scope.token = $cookies.get('token');

        }]);


angular.module('MindlogMaster')
    .controller('GraphController', ['$scope', '$http', '$cookies', '$state', '$filter', function($scope, $http, $cookies, $state, $filter){
        $scope.welcome = "log your mind.";
        $scope.users = [];
        $scope.newUser = {};
        $scope.loginUser = {};
        $scope.newMindlog = {};
        $scope.token = $cookies.get('token');



        $scope.createMindlog = function(){
            $http({
                url: '/api/mindlogs',
                method: 'post',
                headers: {
                    token: $scope.token
                },
                data: $scope.newMindlog
            }).then(function(response){
                var data = response.data.mindlogs;
                drawGraph(data);
            });
        };

//this gets the data when you first load the page, one time use
//give me all the mindlogs associated with the user that I am
        $scope.getGraph = function(){
            $http({
                url: '/api/mindlogs',
                method: 'get',
                //specify who the user is
                headers: {
                    //who the user is
                    token: $scope.token
                }

            }).then(function(response){
                console.log(response);
                if (response.data && response.data.mindlogs && response.data.mindlogs.length > 0){
                    var data = response.data.mindlogs;
                    drawGraph(data);
                }


            });
        };


///real code starts here ****************************************************************************
        // only draw graph when we get back the data from the server
        function drawGraph(data) {

                    var margin = {top: 20, right: 15, bottom: 60, left: 60}
                      , width = 960 - margin.left - margin.right
                      , height = 500 - margin.top - margin.bottom;

                    var lowest = d3.min(data, function(d) {
                        var date = Date.parse(d.timestamp)
                        return date
                    });


                    var highest = d3.max(data, function(d) {
                        var date = Date.parse(d.timestamp)
                        return date
                    });



                    highest = highest - lowest;

                    console.log(highest);
                    console.log(lowest);

                    var x = d3.scale.linear()
                              .domain([0,
                              highest])
                              .range([ 0, width ]);

                    var y = d3.scale.linear()
                    	      .domain([0, d3.max(data, function(d) { return d.rating; })])
                    	      .range([ height, 0 ]);

                    var chart = d3.select('#graph')
                    .html('')
                	.append('svg:svg')
                	.attr('width', width + margin.right + margin.left)
                	.attr('height', height + margin.top + margin.bottom)
                	.attr('class', 'chart')

                    var main = chart.append('g')
                	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                	.attr('width', width)
                	.attr('height', height)
                	.attr('class', 'main')

                    // Define the line
                    var valueline = d3.svg.line()
                        .x(function(d) { return x(Date.parse(d.timestamp) - lowest); })
                        .y(function(d) { return y(d.rating); });

                    // Add the valueline path.
                    main.append("path")
                        .attr("class", "line")
                        .attr("d", valueline(data));

                    // draw the x axis
                    var xAxis = d3.svg.axis()
                	.scale(x)
                	.orient('bottom');

                    main.append('g')
                	.attr('transform', 'translate(0,' + height + ')')
                	.attr('class', 'main axis date')
                	.call(xAxis);

                    // draw the y axis
                    var yAxis = d3.svg.axis()
                	.scale(y)
                	.orient('left');

                    main.append('g')
                	.attr('transform', 'translate(0,0)')
                	.attr('class', 'main axis date')
                	.call(yAxis);

                    var g = main.append("svg:g");

                    g.selectAll("scatter-dots")
                      .data(data)
                      .enter().append("svg:circle")
                          .attr("cx", function (d,i) {
                              return x(Date.parse(d.timestamp) - lowest);
                          })
                          .attr("cy", function (d) { return y(d.rating); } )
                          .attr("r", 8);



}

    }]);

///real code ends here ****************************************************************************










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
