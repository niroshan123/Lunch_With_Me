const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const GeoSchema = new mongoose.Schema({
  type: {
      type: String,
      default: 'Point'
  },
  coordinates: {
      type: [Number],
      index: '2dsphere'
  }
});

// user schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  passwordResetToken: String,
  name: String,
  email: String,
  role: String,
  fullname: String,
  gender: String,
  date_of_birth:Date,
  message:String,
  telephone:String,
  interest: [],
  image: String,
  intProf: String,
  myProf: String,
  creation_dt:Date,
  rank: {
    type: String
  },
  friends:[],
  requests:[],
  handle: String,
  available: {
      type: Boolean,
      default: false
  },
  active: {
    type: Boolean,
    default: false
},
  geometry: GeoSchema,
  timeF: Date,
  timeT: Date,
  pickupLng: String,
  pickupLat: String
});

UserSchema.statics.getUserById = function(id, callback) {
  User.findById(id, callback);
}

UserSchema.statics.getUserByUsername = function(username, callback) {
  let query = {username: username};
  User.findOne(query, callback);
}

UserSchema.statics.getUserByEmail = function(email, callback) {
  let query = {email: email};
  User.findOne(query, callback);
}

UserSchema.statics.getUsers = () => {
  return User.find({}, '-password');
}

UserSchema.statics.addUser = function(newUser, callback) {
  User.getUserByUsername(newUser.username, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
    if (user) {
      let error = {msg: "Username is already in use"};
      return callback(error);
    } 
    User.getUserByEmail(newUser.email, (err, user) => {
      if (err) return callback({msg: "There was an error on getting the user"});
      if (user) {
        let error = {msg: "Email is already in use"};
        return callback(error);
      } 
    
    
    else
    {
      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newUser.password, salt, (err, hash) => {
          if (err) return callback({msg: "There was an error registering the new user"});

          newUser.password = hash;
          newUser.save(callback);
        });
      });
    }
  });
});
};

UserSchema.statics.authenticate = function(username, password, callback) {
  User.getUserByUsername(username, (err, user) => {
    if (err) return callback({msg: "There was an error on getting the user"});
    if (!user) {
      let error = {msg: "Wrong username or password"};
      return callback(error);
    } else {
      bcryptjs.compare(password, user.password, (err, result) => {
        if (result == true) {
          return callback(null, user);
        } else {
          let error = {msg: "Wrong username or password"};
          return callback(error);
        }
      });
    }
  });
};


const User = mongoose.model('User', UserSchema);
module.exports = User;
