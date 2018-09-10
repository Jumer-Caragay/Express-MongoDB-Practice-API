const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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
  });
});

  describe('GET /users/me', () => {
    it('should return a user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });
  
    it('should return 401 if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  
  });

  describe('POST /users', () => {
    it('should create a user', (done) => {
      let email ='example@example.com';
      let password = '123abc!';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if(err) {
            return done(err);
          }

          User.findOne({email}).then((user) => {
            expect(user).toExist(); // check if user object exists after querying
            expect(user.password).toNotBe(password); // check if the original password was hashed inside the database
            done();
          }).catch((e) => done(e));
        });
    });

    it('should return validation errors if request invalid', (done) => {
      let email = 'hello@helloworld.com';
      let password = 'hi';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done)
    });

    it('should not create user if email in use', (done) => {
      let email = 'jummybears@example.com';
      let password = 'helloworld';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done)
    });
  });

  describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: users[1].password
        })
        .expect(200)
        .expect((res) => {
          expect(res.header['x-auth']).toExist();
        })
        .end((err, res) => {
          if(err) {
            return done(err)
          }

          User.findById(users[1]._id).then((user) => {
            expect(user.tokens[0]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          }).catch((e) => done(e));
        });
    });

    it('should reject invalid login', (done) => {
      request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'hello'
      })
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if(err) {
          return done(err)
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0)
          done();
        }).catch((e) => done(e));
      });
    });
  });

  describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err) => {
          if(err) {
            return done(err);
          }

          User.findById(users[0]._id).then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          }).catch((e) => done(e));
        })
    });
  });