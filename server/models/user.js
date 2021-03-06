const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () { // controls what this user model returns
  let newUser = this;
  let userObject = newUser.toObject(); // get the json object returned by the model

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  let newUser = this; // instance methods are called with the individual document
  let access = 'auth';
  let token = jwt.sign({_id: newUser._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  newUser.tokens = newUser.tokens.concat([{access, token}]); // push the token to tokens property

  return newUser.save().then(() => { // returns a promise so server.js can tact on another .then
    return token;
  })
};

UserSchema.methods.removeToken = function (token) {
  let user = this;

  return user.update({
    $pull: { // pull from the user object array and delete it
      tokens: {token}
    }
  }) // return the promise to tact on .then
};

UserSchema.statics.findByToken = function (token) {
  let User = this; // model methods are called with the model name
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
     return Promise.reject();// the .then inside the server.js with the findByToken will not fire if reject receives paramaters it pops up as error
  }

  return User.findOne({
    _id: decoded._id, // heymongodb look for the user with the _id given back from the token
    'tokens.token': token, // also mongodb look inside the tokens property and look for a user with the same token passed from header
    'tokens.access': 'auth' // also mongodb look for also a user with the token that has an access property with auth
  }); // return the promise so we can tact the .then inside server.js
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if(!user) {
      return Promise.reject(); // fire the catch call in server.js
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password,(err, res) => {
        if(res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  const user = this;

  if (user.isModified('password')) { // only encrypt password if it was just modified otherwise it will hash a hashed password
    bcrypt.genSalt(10, (err, salt) => {
      if(err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err)
        }
        user.password = hash
        next();
      })
    })
  } else {
    next();
  }
});

let User = mongoose.model('User', UserSchema);

module.exports = {User}

// let newUser = new User({
//   email: '   jummybears@jummy.com     '
// });

// newUser.save().then((doc) => {
//   console.log(JSON.stringify(doc, undefined, 2))
// }, (err) => {
//   console.log('Unable to save user', err)
// });