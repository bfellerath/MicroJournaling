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
        $scope.welcome = "mindlog";
        $scope.users = [];
        $scope.newUser = {};
        $scope.loginUser = {};
        $scope.newMindlog = {};
        $scope.token = {};



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
        $scope.welcome = "log your mind";
        $scope.users = [];
        $scope.newUser = {};
        $scope.loginUser = {};
        $scope.newMindlog = {};
        $scope.token = $cookies.get('token');
        $scope.currentView = {state: 'all entries', page: 0, pagesLeft: true};



        $scope.allData = [];

//logout has to be in the graph controller because only graph controller is active
//when you are on the profile
//Users controller is only active on the login page
        $scope.logOut = function(){
            console.log("logout");
             $cookies.remove('token');
             $scope.token = $cookies.get('token');
             $state.go("login")


           };

           $scope.validate = function(input){

               if (input && 0 < input && input < 11) {
                   return true;
               } else {
                   return false
               }

           };


         $scope.toggleView = function(){
            //  if ($scope.currentView.state === 'today\'s data') {
                 drawGraph($scope.allData);
                 $scope.currentView.state = 'all entries';
            //  }

            //  else {
            //      drawGraph($scope.allData);
            //      $scope.currentView.state = 'all entries';
            //  }

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
                sinceYesterday = [];
                var data = response.data.mindlogs;
                drawGraph(data);
                $scope.allData = data;
                $scope.entryForm.$setPristine();
                // $scope.currentRecord={};



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
                    //this is an array of the data
                    var data = response.data.mindlogs;
                    // filterByDays(data);
                    //call drawgraph function on the data array
                    drawGraph(data);
                    $scope.allData = data;
                }
            });

        };
    var firstTwelve = [];

        $scope.nextPage = function(){

            filterByQuantity($scope.allData, $scope.currentView.page);
            $scope.currentView.page++


        }

        //gets rid of data older than 24 hours
        var sinceYesterday = [];

        function filterByDays(data){
            var oneDay = 60 * 60 * 24 * 1000;
            var rightNow = Date.now();
            var dayAgo = rightNow - oneDay;
            for (var i = 0; i < data.length; i++){
                //pushes data within the last 24 hours to sinceYesterday array
                if (Date.parse(data[i].timestamp) > dayAgo) {
                    sinceYesterday.push(data[i]);
                }
            }
            drawGraph(sinceYesterday);
        }



        function filterByQuantity(data, page) {

            var currentPage = [];
            var startPoint = data.length - (page * 12);

            console.log(startPoint);

            while (currentPage.length < 12 && startPoint > 0) {
                console.log(currentPage);

                if (data[startPoint]){
                    currentPage.push(data[startPoint]);
                }

                startPoint--;

                if (startPoint <= 0){
                    $scope.currentView.pagesLeft = false;

                }
            }
            firstTwelve.push(currentPage)
            drawGraph(firstTwelve[page]);
        }



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

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Entry:</strong> <span style='color:orange'>" + d.entry + "</span>";
              })

              main.call(tip);

            //circles
            g.selectAll("scatter-dots")
              .data(data)
              .enter()
              .append("svg:circle")
                  //the below is for tooltip
                  .on('mouseover', tip.show)
                  .on('mouseout', tip.hide)
                  .attr("cy", function (d) { return y(d.rating); } )
                  .attr("cx", function (d,i) {
                      return x(Date.parse(d.timestamp) - lowest);
                  })


                  .transition()
                  .duration(1000)

                  .each("start", function() {  // Start animation
                           d3.select(this)  // 'this' means the current element
                               .attr("fill", "red")  // Change color
                               .attr("r", 3);  // Change size
                    })

                    .delay(function(d, i) {
                            return i / data.length * 1000;  // Dynamic delay (i.e. each item delays a little longer)
                        })


                        .attr("fill", "orange")  // Change color

                        .attr("r", 8)


            }
    }]);
