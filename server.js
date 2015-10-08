//require dependencies
var express     =       require('express'),
    bodyParser  =       require('body-parser'),
    mongoose    =       require('mongoose'),
    morgan      =       require('morgan');

//database connection
// mongoose.connect('mongodb://localhost/mindlog_db');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/mindlog_db');



//create application
var app = express();

//server logging
app.use(morgan('dev'));

//setting public folder
app.use(express.static(__dirname + "/client"));

//config body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// view routing
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

// api routing
var UsersController = require('./server/controllers/users');
app.use('/api/users', UsersController);

var MindlogsController = require('./server/controllers/mindlogs');
app.use('/api/mindlogs', MindlogsController);


// start the app
// app.listen(8080, function(){
//     console.log('...listening');
// });

var port = process.env.PORT || 8080;
app.listen(port, function(){
 console.log("... listening");
});
