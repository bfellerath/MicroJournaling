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
    .controller('GraphController', ['$scope', '$http', '$cookies', '$state', function($scope, $http, $cookies, $state){
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
                console.log(data);
            });
        };


        $scope.getGraph = function(){
            $http({
                url: '/api/mindlogs',
                method: 'get',
                headers: {
                    token: $scope.token
                }
                    // data: $scope.newMindlog
            }).then(function(response){
                console.log(response);
                if (response.data && response.data.mindlogs && response.data.mindlogs.length > 0){
                    var data = response.data.mindlogs;
                    console.log(data);
                    drawGraph(data);
                }


                // console.log(data);
                // console.log(response);
            });
        };

        // $scope.getGraph();
        <!-- // spiking for chart from bar chart tutorial video

        // var data = response.data.mindlogs;

        //   var data = [
        //       {"timestamp":"2015-10-03T18:20:27.384Z", "rating":16, "entry": 'blahblah'},
        //       {"timestamp":"2015-10-04T18:20:27.384Z", "rating":56, "entry": 'blahblah2'},
        //       {"timestamp":"2015-10-05T18:20:27.384Z", "rating":7, "entry": 'blahblah3'},
        //       {"timestamp":"2015-10-06T18:20:27.384Z", "rating":77, "entry": 'blahblah4'},
        //       {"timestamp":"2015-10-07T18:20:27.384Z", "rating":22, "entry": 'blahblah5'},
        //       {"timestamp":"2015-10-08T18:20:27.384Z", "rating":16, "entry": 'blahblah6'},
        //   ];

        // maximum of data you want to use
        function drawGraph(data) {
        var data_max = 80,

        //number of tickmarks to use
        num_ticks = 5,

        //margins
        left_margin = 60,
        right_margin = 60,
        top_margin = 30,
        bottom_margin = 0;

        var w = 500,    //width
        h = 700,    //height
        color = function(id) { return '#00b3dc' };

        var x = d3.scale.linear()
        .domain([0, data_max])
        .range([0, w - ( left_margin + right_margin )]),
        y = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeBands([bottom_margin, h - top_margin], .5);

        var chart_top = h - y.rangeBand()/2 - top_margin;
        var chart_bottom = bottom_margin + y.rangeBand()/2;
        var chart_left = left_margin;
        var chart_right = w - right_margin;

        // Setup the SVG element and position it

        var vis = d3.select("#graph")
        .html('')
        .append("svg:svg")
          .attr("width", w)
          .attr("height", h)
        .append("svg:g")
          .attr("id", "scatterplot")
          .attr("class", "scatterplot")

        //ticks
        var rules = vis.selectAll("g.rule")
        .data(x.ticks(num_ticks))
        .enter()
        .append("svg:g")
        .attr("transform", function(d)
          {
          return "translate(" + (chart_left + x(d)) + ")";
        });

        rules.append("svg:line")
        .attr("class", "tick")
        .attr("y1", chart_top)
        .attr("y2", chart_top + 4)
        .attr("stroke", "black");

        rules.append("svg:text")
        .attr("class", "tick_label")
        .attr("text-anchor", "middle")
        .attr("y", chart_top)
        .text(function(d)
        {
        return d;
        });


        var bbox = vis.selectAll(".tick_label").node().getBBox();
        vis.selectAll(".tick_label")
        .attr("transform", function(d)
        {
          return "translate(0," + (bbox.height) + ")";
        });

        var bars = vis.selectAll("g.bar")
        .data(data)
        .enter()
        .append("svg:g")
          .attr("class", "bar")
          .attr("transform", function(d, i){
              return "translate(0, " + y(i) + ")";
          });

        bars.append("svg:rect")
        .attr("x", right_margin)
        .attr("width", function(d) {
          return (x(d.rating));
          })
        .attr("height", y.rangeBand())
        .attr("fill", color(0))
        .attr("stroke", color(0));

        //Labels
        var timestamps = vis.selectAll("g.bar")
        .append("svg:text")
          .attr("class", "timestamp")
          .attr("x", 0)
          .attr("text-anchor", "right")
          .text(function(d) {
              var format = d3.time.format.utc('%Y-%m-%dT%H:%M:%S.%LZ');
              var parsedDate = format.parse(d.timestamp).toString();
              parsedDate = parsedDate.split("GMT");
              parsedDate = parsedDate[0];
              return parsedDate;
          });

        var bbox = timestamps.node().getBBox();
        vis.selectAll(".timestamp")
        .attr("transform", function(d) {
          return "translate(0, " + (y.rangeBand()/2 + bbox.height/4) + ")";
        });

        timestamps = vis.selectAll("g.bar")
          .append("svg:text")
              .attr("class", "rating")
              .attr("x", function(d)
                  {
                  return x(d.rating) + right_margin + 10;
                  })
              .attr("text-anchor", "left")
              .text(function(d)
              {
              return "" + d.rating + "%";
              });
        bbox = timestamps.node().getBBox();
        vis.selectAll(".rating")
          .attr("transform", function(d)
          {
              return "translate(0, " + (y.rangeBand()/2 + bbox.height/4) + ")";
          });





        //Axes
        vis.append("svg:line")
        .attr("class", "axes")
        .attr("x1", chart_left)
        .attr("x2", chart_left)
        .attr("y1", chart_bottom)
        .attr("y2", chart_top)
        .attr("stroke", "black");
        vis.append("svg:line")
        .attr("class", "axes")
        .attr("x1", chart_left)
        .attr("x2", chart_right)
        .attr("y1", chart_top)
        .attr("y2", chart_top)
        .attr("stroke", "black");

}

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
