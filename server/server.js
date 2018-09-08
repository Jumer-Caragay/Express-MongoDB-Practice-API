require('./config/config');

const _ = require ('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json()); // allows post request from user as json object

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.status(200).send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos}) // send todos back as an object not array
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  // validate id
    // 404 - send back empty

  Todo.findById(id).then((todo) => {
    if(!todo) {
      return res.status(404).send({});
    }

    res.send({todo});
  }).catch((e) => res.status(400).send({}));
  //findById
    //success
      // if todo - send it back
      // if no todo - send back 404 with empty body
    //error
      // 400 and send empty body back
});

app.delete('/todos/:id', (req, res) => {
  // get the id
  let id = req.params.id;
  
  // validate the id -> not valid? return 404
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // remove todo by id
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.status(200).send({todo});
  }).catch((e) => res.status(400).send());
    // success
      // check if document came back
      // if no doc, send 404
      // if doc send doc with 200 status code
    // error
      // 400 with empty body
});

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']) // use lodash pick method to pick certain properties that way users cannot add random properties or update certain ones.

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) { // check whether user completed a todo or setting it to false
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password'])
  let newUser = new User(body)


  newUser.save().then(() => {
    return newUser.generateAuthToken(); // returns a promise
  }).then((token) => {
    res.header('x-auth', token).send(newUser); // x-auth custom header for storing token
  }).catch((e) => {
    res.status(400).send(e);
  }) 
})


app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};


