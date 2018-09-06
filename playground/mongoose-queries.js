const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// let id = '5b9194e9086e9f346611250711';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid')
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos); // returns an array of documents with just find
// });

// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo); // returns an object document with findOne
// });

// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('Id not found') // handle the case where the id doesn't exist inside the database
//   }
//   console.log('Todo By Id', todo); // returns an object document with findOne
// }).catch((e) => console.log(e)); // handle the case where objectId was just completely invalid

let userID = '6b917e5fe26d5f5c421b9695';
User.findById(userID).then((user) => {
  if (!user) {
    return console.log('User not found')
  }
  console.log('User', user)
}).catch((e) => console.log(e));