const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Conversation = require('../models/conversation');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const log = require('../log');
const emailhandler = require("../models/emailconfig");
var bcryptjs = require('bcryptjs');


// Update User Location
router.get('/locationAdd/:id', function(req, res, next){
  //console.log(req.params.id);
  User.findByIdAndUpdate(req.params.id, {geometry:{"coordinates":[parseFloat(req.query.lng),parseFloat(req.query.lat)]}}, {rank: '10000'}, function (err, user) {
      if (err) return res.status(500).send("There was a problem updating the user.");
      res.status(200).send(user);
  });
});

// Get near users 
router.get('/location', function(req, res, next){
  User.geoNear(
      {type: 'Point', coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]},
      {maxDistance: 1000000, spherical: true}
  ).then(function(users){
      res.status(200).send(users);
  }).catch(next);
});

// register
router.post('/register', (req, res, next) => {
  let response = {success: false};
  
  if (!(req.body.password == req.body.confirmPass)) {
   // let err = 'The passwords don\'t match';
   response.success = false;
   response.msg = "The passwords don\'t match. Please check again";
   console.log("[%s] authenticated false");
   res.json(response);
  //  return next(err);
  }
  else {
    let newUser = new User({
      username: req.body.username.trim(),
      password: req.body.password.trim(),
      role: 'User',
      email: req.body.email
    });


    User.addUser(newUser, (err, user) => {
      console.log(req.body.password)
      if (err) {
        response.msg = err.msg || "Failed to register user";
        res.json(response);
      } else {
        response.success = true;
        response.msg = "User authenticated successfuly. Please check your Email to activate your account!";
        response.user = {
          id: user._id,
          username: user.username
        }
       emailhandler.mailhandleremailconfirm(user.email,user.username,'1212')
        console.log("[%s] registered successfuly", user.username);
        res.json(response);
      }
    });

    // User.authenticate(req.body.username.trim(), req.body.password.trim(), (err, user) => {
    //   if (err) {
    //     response.msg = err.msg;
    //     res.json(response);
    //   }  // create the unique token for the user
    // else if(!user.active){
    //   response.success = false;
    //   response.msg = "Your Account is not yet activated.";
    //   console.log("[%s] authenticated false", user.username);
    //      }else{
    //       let signData = {
    //         id: user._id,
    //         username: user.username
    //       };
    //       let token = jwt.sign(signData, config.secret, {
    //         expiresIn: 604800
    //       });
  
    //       response.token = "JWT " + token;
    //       response.user = signData;
    //       response.success = true;
    //       response.msg = "User authenticated successfuly.";
    //       response.email = user.email;
  
    //       console.log("[%s] authenticated successfuly", user.username);
    //       res.json(response);
    //   }
    // });
  }
});

//login
router.post("/authenticate", (req, res, next) => {
  let body = req.body;
  let response = {success: false};

  User.authenticate(body.username.trim(), body.password.trim(), (err, user) => {
    if (err) {
      response.msg = err.msg;
      res.json(response);
      console.log(err);
    }  // create the unique token for the user
  else if(!user.active){
    response.success = false;
    response.msg = "Your Account is not yet activated.";
    res.json(response);
    console.log("[%s] authenticated false", user.username);
  }else{
        let signData = {
          id: user._id,
          username: user.username,
          pickupLat: user.pickupLat,
          pickupLng: user.pickupLng,
          timeF: user.timeF,
          timeT: user.timeT
        };
        let token = jwt.sign(signData, config.secret, {
          expiresIn: 604800
        });

        response.token = "JWT " + token;
        response.user = signData;
        response.success = true;
        response.msg = "User authenticated successfuly.";
        response.email = user.email;

        console.log("[%s] authenticated successfuly", user.username);
        res.json(response);
    }
  });
});

//logged user  profile
router.get('/profile', passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let response = {success: true};
  response.msg = "Profile retrieved successfuly";
  response.user = req.user;
  res.json(response);
});


//Meetup time update
router.post('/meet',function(req, res){
 // console.log("apu data 1 - - - "+JSON.stringify(req.body))

  var newdata = {
  }

  if(req.body.timeF){
    newdata['timeF'] =  req.body.timeF;
    newdata['timeF'] = newdata['timeF'].split(':');
    newdata['timeF'][ newdata['timeF'].length - 1] =  '00.000Z';
    newdata['timeF'] = newdata['timeF'].join(':')
    //console.log(newdata['timeF']);
    
  }
  if(req.body.timeT){
    newdata['timeT'] =  req.body.timeT;
    newdata['timeT'] = newdata['timeT'].split(':');
    newdata['timeT'][ newdata['timeT'].length - 1] =  '00.000Z';
    newdata['timeT'] = newdata['timeT'].join(':')
    //console.log(newdata['timeT']);
  }
  if(req.body.timeF){
    newdata['pickupLng'] =  req.body.pickupLng;
  }
  if(req.body.timeF){
    newdata['pickupLat'] =  req.body.pickupLat;
  }

  User.updateOne({email:req.body.email}, {geometry:{"coordinates":[parseFloat(req.body.pickupLng),parseFloat(req.body.pickupLat)]}}, {rank: '10000'}, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");
});

  User.updateOne({email:req.body.email},newdata,{upsert: true}).then(doc=>{
  //  console.log("succss - "+JSON.stringify(doc))
    return res.status(201).json(doc);
  })     
})

//User Details Register
router.post('/registerdetails',function(req, res){


  //console.log("apu data 0 - - - "+JSON.stringify(req.body))

  var newdata = {
          fullname: req.body.fullname,
          gender: req.body.gender,
          date_of_birth:req.body.dob,
          message: req.body.self_description,
          telephone:req.body.telephone,
          interest:req.body.interest,
          image:req.body.image,
          myProf:req.body.myProf,
          intProf:req.body.intProf,
          creation_dt: Date.now()
  }

  

  User.updateOne({email:req.body.email},newdata,{upsert: true}).then(doc=>{
    //console.log("succss - "+JSON.stringify(doc))
     return res.status(201).json(doc);
   //return res.status(201);
  })     
})


// router.get('/all',  (req, res, next) => {
//   User.getUsers()
//     .then(users => {
//       let response = {
//         success: true,
//         users: users
//       };
//       return res.json(response);

router.get('/allUsers',  (req, res, next) => {
  User.getUsers()
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});


//Get Matching Users
router.get('/all',  passport.authenticate("jwt", {session: false}), (req, res, next) => {
  let usr = [];
  User.find({_id: req.user.id})
    .then(user => {
      //console.log(user[0].username);
      //console.log(user[0].pickupLat);
      //console.log(user[0].pickupLng);
      User.geoNear(
          {type: 'Point', coordinates: [parseFloat(user[0].pickupLng), parseFloat(user[0].pickupLat)]},
          {maxDistance: 1000, spherical: true}
      // User.aggregate([
      //   {
      //     $geoNear: {
      //       near: {
      //         type: 'Point', coordinates: [parseFloat(users[0].pickupLng), parseFloat(users[0].pickupLat)]
      //       },
      //       maxDistance: 1000,
      //       spherical: true
      //     }
      //   }
      // ],
      // { cursor:{} }
      ).then(function(users){
        //console.log('location');
        //console.log(users);
        for(var u of users){
          usr.push(u.obj._id);
          //console.log(u.obj.username);
        }
       // console.log(usr);
        //console.log(user[0].interest);
        //console.log(user[0].intProf);
        //console.log(new Date(user[0].timeF));
        //console.log(new Date(user[0].timeT));
        // res.status(200).send(users);
        User.find(
          {$and : [{ _id: { "$in" : usr}, interest: { "$in" : user[0].interest}, myProf: user[0].intProf }, {timeT : { $gte: new Date() }},
          {$or: [ 
            { timeF : { $lte: new Date(user[0].timeF) }, timeT : { $gte: new Date(user[0].timeF) } },
            { timeF : { $lte: new Date(user[0].timeT) }, timeT : { $gte: new Date(user[0].timeT) } },
            { timeF : { $gte: new Date(user[0].timeF) }, timeT : { $lte: new Date(user[0].timeT) } }
          ]}]
        }
        ).then(users => {
          //console.log(users)
          let response = {
            success: true,
            users: users
          };
          res.status(200).send(response);
        })
      }).catch(next);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// router.get('/all',  passport.authenticate("jwt", {session: false}), (req, res, next) => {
//   let usr = [];
//   User.find({_id: req.user.id})
//     .then(user => {
//       console.log(user[0].username);
//       console.log(user[0].pickupLat);
//       console.log(user[0].pickupLng);
//       User.geoNear(
//           {type: 'Point', coordinates: [parseFloat(user[0].pickupLng), parseFloat(user[0].pickupLat)]},
//           {maxDistance: 1000, spherical: true}
//       // User.aggregate([
//       //   {
//       //     $geoNear: {
//       //       near: {
//       //         type: 'Point', coordinates: [parseFloat(users[0].pickupLng), parseFloat(users[0].pickupLat)]
//       //       },
//       //       maxDistance: 1000,
//       //       spherical: true
//       //     }
//       //   }
//       // ],
//       // { cursor:{} }
//       ).then(function(users){
//         console.log('location');
//         //console.log(users);
//         for(var u of users){
//           usr.push(u.obj._id);
//           console.log(u.obj.username);
//         }
//         console.log(usr);
//         console.log(user[0].interest);
//         console.log(user[0].intProf);
//         console.log(new Date(user[0].timeF));
//         console.log(new Date(user[0].timeT));
//         // res.status(200).send(users);
//         User.find(
//           {$and : [{ _id: { "$in" : usr}, interest: { "$in" : user[0].interest}, myProf: user[0].intProf }, 
//           {$or: [ 
//             { timeF : { $lte: new Date(user[0].timeF) }, timeT : { $gte: new Date(user[0].timeF) } },
//             { timeF : { $lte: new Date(user[0].timeT) }, timeT : { $gte: new Date(user[0].timeT) } },
//             { timeF : { $gte: new Date(user[0].timeF) }, timeT : { $lte: new Date(user[0].timeT) } }
//           ]}]
//         }
//         ).then(users => {
//           console.log(users)
//           let response = {
//             success: true,
//             users: users
//           };
//           res.status(200).send(response);
//         })
//       }).catch(next);
//     })
//     .catch(err => {
//       log.err('mongo', 'failed to get users', err.message || err);
//       return next(new Error('Failed to get users'));
//     });

// });


//Accept Friend Request
router.get('/accept/:id/:username',  passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.update({_id: req.user.id}, { $pull: { "requests": {
      username: req.params.username
  } } }).then(users => {
    let response = {
      success: true,
      users: users
    };
  //  console.log(response);
  })
  User.update({_id: req.user.id}, { $pull: { "friends": {
    username: req.params.username
  } } }).then(users => {
    return res.json(users);
  })
  User.update({_id: req.params.id}, { $push: { "friends": {
      _id: req.user.id,
      username: req.user.username
  } } })
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
  User.update({_id: req.user.id}, { $push: { "friends": {
      _id: req.params.id,
      username: req.params.username
  } } })
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// Send Friend Request
router.get('/request/:id/:username',  passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.update({_id: req.params.id}, { $pull: { "requests": {
      _id: req.user.id,
      username: req.user.username
  } } }).then(users => {
    let response = {
      success: true,
      users: users
    };
 //   console.log(response);
  })
  .catch(err => {
    log.err('mongo', 'failed to get users', err.message || err);
    return next(new Error('Failed to get users'));
  });
  User.update({_id: req.params.id}, { $push: { "requests": {
    _id: req.user.id,
    username: req.user.username
  } } })
    .then(users => {
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// current user list
router.get('/',  passport.authenticate('jwt', { session: false }), (req, res, next) => {
  User.find({_id: req.user.id})
    .then(users => {
      users[0].password = ''
      //console.log('a00');
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

// chat user list
router.get('/chatlist',  passport.authenticate('jwt', { session: false }), (req, res, next) => {
  chatlist  = [];
  User.find({_id: req.user.id})
    .then(users => {
      Conversation.find()
        .then(conversation => {
          for(var i=0; i<conversation.length; i++){
            if(conversation[i]['participants'][0])
              if(conversation[i]['participants'][0]['username'] == users[0]['username']){
                for(var z=0;z<chatlist.length; z++)
                  if(chatlist[z]==users[0]['username'] || conversation[i]['participants'][1]['username'])
                    continue;
                chatlist.push(conversation[i]['participants'][1]['username'])
              }
            if(conversation[i]['participants'][1])
              if(conversation[i]['participants'][1]['username'] == users[0]['username']){
                for(var z=0;z<chatlist.length; z++)
                  if(chatlist[z]==users[0]['username'] || conversation[i]['participants'][0]['username'])
                    continue;
                chatlist.push(conversation[i]['participants'][0]['username'])
              }
          }
          let response = {
            success: true,
            users: users,
            chat: chatlist
          };
          console.log(chatlist)
          return res.json(response);
        })
        .catch(err => {
          log.err('mongo', 'failed to get users', err.message || err);
          return next(new Error('Failed to get users'));
        });
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});

//Get users by username
router.get('/users/:username',  (req, res) => {
  User.find({username: req.params.username})
    .then(users => {
      //console.log(users);
      if(users.length>0)
        users[0].password = ''
      let response = {
        success: true,
        users: users
      };
      return res.json(response);
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
});






// Route to getSugestedProfileDetails	
router.get('/getSugestedProfileDetails/:id', function(req, res) {
  //console.log("dkwbwhb")

  // console.log("am i getSugestedProfileDetails?")
//console.log("id usr - "+req.params.id)

  User.findOne({ _id:req.params.id }, function(err, user) {
    //console.log(user)

    if (err) throw err; // Throw error if cannot login
      console.log("successfullly get getSugestedProfileDetails")
  res.json(user)
     
  });
});



 // Route to activate the user's account	
router.get('/active/:email', function(req, res) {
   let response = {}
   console.log("email usr - "+req.params.email)
    User.updateOne({email:req.params.email},{active: true},{upsert: true}).then(doc=>{
    return res.status(201).json(doc);
  })  

});

//*********/Route to forgotpasswordEmailVerification**********
router.post('/forgotpasswordEmailVerification',(req,res,next)=>{
  User.find({email: req.body.email})
    .then(users => {
      if(users.length==0){
        return res.status(400).json({'msg': 'user not found'});
      } else {
        var token  = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 16; i++ ) {
          token += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        console.log(req.body.email)
        var newdata={
          passwordResetToken: token
        }
        User.updateOne({email:req.body.email},newdata,{upsert: true}).then(doc=>{
        })
        emailhandler.mailhandlerpasswordreset(req.body.email,token)
        console.log("password forgot")
        
        return res.json({"msg": "Mail Sent.Please check your Email to Reset your password."});
      }
    })
    .catch(err => {
      log.err('mongo', 'failed to get users', err.message || err);
      return next(new Error('Failed to get users'));
    });
  
})


// ******Route to forgot password*****************
router.post('/forgotPassword',(req, res, next) => {
  console.log("bdjbjb")
  
  let response = {success: false};
  
  if (!(req.body.newpassword == req.body.newcnfpass)) {
   console.log("password does not match")
   response.success = false;
   response.msg = "The passwords don\'t match. Please check again";
   console.log("[%s] authenticated false");
   res.json(response);
  }
  else {
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(req.body.newpassword, salt, (err, hash) => {
        if (err) return callback({msg: "There was an error registering the new user"});

        var newdata={
          password:hash,
        }
          User.updateOne({email:req.body.email},newdata,{upsert: true}).then(doc=>{
          response.success = true;
          response.msg = "Sucessfully updated your password";
          console.log("Sucessfully updated your password")
          res.json(response);
        
        })  
      });
    });
}


});


// *********Socialregister******************



// router.post('/google', (req, res, next) => {


// console.log("******** backend check for social media through login******")
// console.log(req.body.email)

// let response = {success: false};



// let user = User.findOne({ email: req.body.email }, (err, user) => {
//   if (err || !user) {
//       // create a new user and login
//      console.log("user not found")

//      let newUser = new User({
//      role: 'User',
//       email: req.body.email
//     });


//     User.addUser(newUser, (err, user) => {
//       if (err) {

//        console.log(err)
//       } else {
//         response.success = true;
       
      
//         console.log("[%s] registered successfuly");
      
//       }
//     });


//   } else {
//       // update existing user with new social info and login***********************
//       console.log("user available")
//       //response.success = true;
//       let signData = {
//         id: user._id,
//         username: user.username,
//         pickupLat: user.pickupLat,
//         pickupLng: user.pickupLng,
//         timeF: user.timeF,
//         timeT: user.timeT
//       };
//       let token = jwt.sign(signData, config.secret, {
//         expiresIn: 604800
//       });

//       response.token = "JWT " + token;
//       response.user = signData;
//       response.success = true;
//       response.msg = "User authenticated successfuly.";
//       // response.email = user.email;

//       console.log("[%s] authenticated successfuly");
//       res.json(response);
//   }
// });
// })
router.post('/google', (req, res, next) => {

console.log("fnekjrgbbg")


})
  



module.exports = router;