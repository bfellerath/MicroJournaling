var express         =       require('express'),
    User            =       require('../models/user'),
    mindlogsRouter  =       express.Router();


mindlogsRouter.post('/', function(req, res){
    //find the user by the token
    //push in the mindlog
    //save the user
    //send the user back as json
    User.findOne({token: req.headers.token}, function(err, user){
        user.mindlogs.push(req.body);
        user.save(function(){
            res.json(user);
        });

    });
});

mindlogsRouter.get('/', function(req, res){
    //find the user by the token
    //push in the mindlog
    //save the user
    //send the user back as json
    User.findOne({token: req.headers.token}, function(err, user){
        // user.mindlogs.(req.body);
        // user.save(function(){
            res.json(user);
        // });

    });
});

module.exports = mindlogsRouter;








// //MINDLOG CONTROLLER AND ROUTING
//
// var express = require('express');
//
// var MindlogsController = express.Router();
//
//
// var Mindlog = require('../models/mindlog');
//
//
// MindlogsController.get('/', function(req, res){
//     Mindlog.find({}, function(err, mindlogs){
//         res.json(mindlogs);
//     });
// });
//
// MindlogsController.post('/', function(req, res){
//     var mindlog = new Mindlog(req.body);
//     mindlog.save(function(err, mindlog){
//         res.json(mindlog);
//     });
// });
//
// MindlogsController.delete('/:id', function(req, res){
//     var id = req.params.id;
//     Mindlog.findByIdAndRemove(id, function(){
//         res.json({status: 202, message: 'success'});
//     });
// });
//
// module.exports = MindlogsController;
