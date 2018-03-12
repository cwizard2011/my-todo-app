const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo')
const {User} = require('./../server/models/user')
// const id = '5a7c501b71fad0e81db0af19';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// });

// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     return console.log('Id not found')
//   }
//   console.log('Todo by id', todo);
// }).catch((e) => console.log(e));
const id = '5a7b1492f85e7724070528c8'
User.findById(id).then((user) => {
    if(!user) {
      return console.log('Id not found')
    }
    console.log('User by id', user);
  }).catch((e) => console.log(e));