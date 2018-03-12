const {ObjectID} = require('mongodb');
const {Todo, Task} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'cwizard@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const todos = [{
  _id: new ObjectID(),
  text: 'First test todos',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const tasks = [{
  _id: new ObjectID(),
  text: 'First test task',
  priority: 'urgent',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test task',
  priority: 'critical',
  completed: true,
  completedAt: 444,
  _creator: userTwoId
}]
const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateTasks = (done) => {
  Task.remove({}).then(() => {
    return Task.insertMany(tasks);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = { todos, populateTodos, tasks, populateTasks, users, populateUsers}