const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
  let newUser = this;
  let access = 'auth';
  let token = jwt.sign({_id: newUser._id.toHexString(), access}, 'abc123').toString();

  newUser.tokens = newUser.tokens.concat([{access, token}]); // push the token to tokens property

  return newUser.save().then(() => { // returns a promise so server.js can tact on another .then
    return token;
  })
};

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