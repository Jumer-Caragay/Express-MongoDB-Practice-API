// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb') 

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp')

  // db.collection('Todos').find({
  //   _id: new ObjectID('5b90a968c06d4e15c1769ce6')
  // }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2))
  // }, (err) => {
  //   console.log('Unable to fetch todos', err)
  // }) // find can accept certain object properties and select all of them or use objectID

  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err)
  // }) get's the number of collections in the todos collection

  db.collection('Users').find({name: 'Jummy'}).toArray().then((docs) => {
    console.log(JSON.stringify(docs, undefined, 2))
  }, (err) => {
    console.log('Could not fetch the given user', err)
  })
  // client.close();
});