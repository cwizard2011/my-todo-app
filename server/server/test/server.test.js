
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo, Task} = require('./../models/todo');
const {User} = require('./../models/user')
const {todos, populateTodos, tasks, populateTasks, users, populateUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos);
beforeEach(populateTasks);


describe('POST /api/v1/todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text';

    request(app)
    .post('/api/v1/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text)
        done();
      }).catch((e) => done(e));
    });
  });
  it('should not create todo with invalid body data', (done) => {

    request(app)
    .post('/api/v1/todos')
    .set('x-auth', users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    })
  })
});

describe('GET /api/v1/todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/api/v1/todos')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(1);
    })
    .end(done);
  })
})

describe('GET /api/v1/todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/api/v1/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return not todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .get(`/api/v1/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/api/v1/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /api/v1/todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/api/v1/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done()
        }).catch((e) => done(e));
      });
  });

  it('should not remove a todo not created by user', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/api/v1/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done()
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/api/v1/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)  
    .expect(404)
    .end(done);
  });

  it('should return 404 if todo id is invalid', (done) => {
    request(app)
    .delete('/api/v1/todos/123abc')
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe('PATCH /api/v1/todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let text = 'New text';

    request(app)
      .patch(`/api/v1/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        // expect(res.body.todo.completedAt).toBeA('number');
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the todo not created by user', (done) => {
    let hexId = todos[0]._id.toHexString();
    let text = 'New text';

    request(app)
      .patch(`/api/v1/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    
    let hexId = todos[1]._id.toHexString();
    let text = 'New text!!';

    request(app)
      .patch(`/api/v1/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  })
});

describe('POST /api/v1/todos/:id/tasks', () => {
  it('should create a new task', (done) => {
    let text = 'Test task text';
    let priority = 'urgent'

    request(app)
    .post('/api/v1/todos/:id/tasks')
    .set('x-auth', users[0].tokens[0].token)
    .send({text, priority})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
      expect(res.body.priority).toBe(priority);
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Task.find({text, priority}).then((tasks) => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].text).toBe(text)
        expect(tasks[0].priority).toBe(priority)
        done();
      }).catch((e) => done(e));
    });
  });
  it('should not create tasks with invalid body data', (done) => {

    request(app)
    .post('/api/v1/todos/:id/tasks')
    .set('x-auth', users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Task.find().then((tasks) => {
        expect(tasks.length).toBe(2);
        done();
      }).catch((e) => done(e));
    })
  })
});

describe('GET /api/v1/todos/:id/tasks', () => {
  it('should get all tasks', (done) => {
    request(app)
    .get('/api/v1/todos/:id/tasks')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.tasks.length).toBe(1);
    })
    .end(done);
  })
})

describe('GET /api/v1/todos/:id/tasks/:id', () => {
  it('should return task doc', (done) => {
    request(app)
      .get(`/api/v1/todos/${todos[0]._id.toHexString()}/tasks/${tasks[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(tasks[0].text);
        expect(res.body.task.priority).toBe(tasks[0].priority);
      })
      .end(done);
  });

  it('should return not tasks doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}/tasks/${tasks[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if task not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .get(`/api/v1/todos/${hexId}/tasks/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 for tasks non-object ids', (done) => {
    request(app)
      .get(`/api/v1/todos/${todos[0]._id.toHexString()}/tasks/123ccc`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /api/v1/todos/:id/tasks/:id', () => {
  it('should remove a task', (done) => {
    let hexId = tasks[1]._id.toHexString();

    request(app)
      .delete(`/api/v1/todos/${hexId}/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  
      .expect(200)
      .expect((res) => {
        expect(res.body.task._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Task.findById(hexId).then((task) => {
          expect(task).toBeFalsy();
          done()
        }).catch((e) => done(e));
      });
  });

  it('should not remove a task not created by user', (done) => {
    let hexId = tasks[0]._id.toHexString();

    request(app)
      .delete(`/api/v1/todos/${hexId}/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        Task.findById(hexId).then((task) => {
          expect(task).toBeTruthy();
          done()
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if task not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/api/v1/todos/${hexId}/tasks/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)  
    .expect(404)
    .end(done);
  });

  it('should return 404 if task id is invalid', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
    .delete(`/api/v1/todos/${hexId}/tasks/123ccc`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe('PATCH /api/v1/todos/:id/tasks/:id', () => {
  it('should update the task', (done) => {
    let hexId = tasks[0]._id.toHexString();
    let text = 'New text';
    let priority = 'more urgent';

    request(app)
      .patch(`/api/v1/todos/${hexId}/tasks/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text,
        priority
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(text);
        expect(res.body.task.completed).toBe(true);
        expect(res.body.task.priority).toBe(priority);
        // expect(res.body.todo.completedAt).toBeA('number');
        expect(typeof res.body.task.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the task not created by user', (done) => {
    let hexId = tasks[0]._id.toHexString();
    let text = 'New text';
    let priority = 'Not urgent';

    request(app)
      .patch(`/api/v1/todos/${hexId}/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text,
        priority
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when task is not completed', (done) => {
    
    let hexId = tasks[1]._id.toHexString();
    let text = 'New text!!';
    let priority = 'Not really urgent';

    request(app)
      .patch(`/api/v1/todos/${hexId}/tasks/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text,
        priority
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.task.text).toBe(text);
        expect(res.body.task.priority).toBe(priority);
        expect(res.body.task.completed).toBe(false);
        expect(res.body.task.completedAt).toBeFalsy();
      })
      .end(done);
  })
});

describe('GET /api/v1/users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/api/v1/users/me')
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
      .get('/api/v1/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done)
  })
});

describe('POST /api/v1/users', () => {
  it('should create a user', (done) => {
    let email= 'example@peter.com';
    let password = '123def';
    let userName = 'ccwizard';
    let firstName = 'Ade';
    let lastName = 'Bisi';

    request(app)
      .post('/api/v1/users')
      .send({email, password, userName, firstName, lastName})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
        // expect(res.body.userName).toEqual(userName);
        // expect(res.body.firstName).toBe(firstName);
        // expect(res.body.lastName).toBe(lastName);
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password)
          done()
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    let email = 'cwizard.com';
    let password = '123a';

    request(app)
      .post('/api/v1/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
  
  it('should not create user if email in use', (done) => {
    let email = users[0].email;
    let password = '123abcd'
    request(app)
      .post('/api/v1/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe('POST /api/v1/users/login', () => {
  it('should login users and return auth token', (done) => {
    
    request(app)
      .post('/api/v1/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });
  it('should reject invalid login', (done) => {
    request(app)
      .post('/api/v1/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1)
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /api/v1/users/me/token', () => {
  it('should remove auth token on logout', (done) => {

    request(app)
      .delete('/api/v1/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e))
      })
  })
})