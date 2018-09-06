const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //setup mongo to use promises
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};