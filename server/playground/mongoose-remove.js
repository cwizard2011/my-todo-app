const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

//Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findByIdAndRemove('5a7cca38d0301e7825e32131').then((todo) => {
  console.log(todo);
});