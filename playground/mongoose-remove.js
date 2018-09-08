const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result)
// }); // removes all the documents in that collection and return the number

// Todo.findOneAndRemove // return the document and removes it from the database
// Todo.findByIdAndRemove // find by the id and remove it return the document back

// Todo.findOneAndRemove({_id: '5b9315129c8a8de057c78b47'}).then((todo) => {

// });

// Todo.findByIdAndRemove('5b9315129c8a8de057c78b47').then((todo) => {
//   console.log(todo);
// });

// The methods above accomplish the same thing but the biggest difference between the two
// is whether you need to remove an item with more than just the ID