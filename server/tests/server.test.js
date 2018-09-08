const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text';
    request(app)
    .post('/todos')
    .send({text}) // super test sends data as json object
    .expect(200) // expect the status code is 200
    .expect((res) => {
      expect(res.body.text).toBe(text); // checks if the response return from the server has the text we added
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1) // checks to add 1 to database
        expect(todos[0].text).toBe(text); // checks if the todo was the todo we added into the database
        done();
      }).catch((e) => done(e));
    })
  });

  it('should not create todo with invalid body data', (done) => {
    let text = '';
    request(app)
    .post('/todos')
    .send({text})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err); // checks if their was any errors above if not we can check database assertions
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2)
        done();
      }).catch((e) => done(e)); //catch any errors if errors within database errors
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2) // test the number of things in the database should be 2
    })
    .end(done);
    })
  });

  describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // get the object id as a string from the first item in the todos variable
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text); // take the response body and check if the id we entered returns the text todo that we wanted.
      })
      .end(done)
  });

    it('should return 404 if todo not found', (done) => {
      request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done)
    });

    it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123')
        .expect(404)
        .end(done)
    })
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId) // check if the item deleted returned by the server matches the id we wanted to delete.
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // query database using findById
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

   it('should return 404 if todo not found', (done) => {
    request(app)
    .delete(`/todos/${new ObjectID().toHexString()}`)
    .expect(404)
    .end(done)
  });

   it('should return 404 if object id is invalid', (done) => {
    request(app)
    .delete('/todos/123')
    .expect(404)
    .end(done)
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    // grab id of first item

    let body = {text: 'Updated text for patch request', completed: true}
    request(app)
      .patch(`/todos/${hexId}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(body.text)
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeA('number')
      })
      .end(done)
    // update text, set completed to true
    // 200 status returned
    // response should show that text is changed, completed is true, completedAt is a number using .toBeA
  });
  
  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[0]._id.toHexString();
    // grab id of second todo item

    let body = {text: 'Updated text for patch request', completed: false}
    request(app)
      .patch(`/todos/${hexId}`)
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(body.text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done)
     // update text, set completed to false
     // 200
     // text is changed, completed false, completedAt is null .toNotExist
  })
});