let {User} = require('../models/user');

let authenticate = (req, res, next) => {
  let token = req.header('x-auth')

  User.findByToken(token).then((user) => {
    if(!user) { // the case scenario where the jwt was verified by couldn't find a user!
      return Promise.reject(); // runs the catch case
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send(); // don't run next so the next route doesn't run
  });
}

module.exports = {authenticate};