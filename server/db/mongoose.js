const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //setup mongo to use promises
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};