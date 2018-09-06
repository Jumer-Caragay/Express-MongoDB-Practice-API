// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb') 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // findOneAndUpdate
  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('5b90b07ec06d4e15c1769fa9')
  // }, {
  //   $set: { // update operators from mongodb documentation
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false // get back the updated result
  // }).then((result) => {
  //   console.log(result);
  // })

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5b9026cf9727cd8bdc9e38e5')
  }, {
    $set: {
      name: 'Jumer'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  })

  // client.close();
});