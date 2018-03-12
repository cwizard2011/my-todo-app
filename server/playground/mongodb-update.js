// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
//  db.collection('Todos').findOneAndUpdate({
//    _id: new ObjectID('524adb75bmkc900')
//  }, {
//    $set: {
//      completed: true
//    }
//  }, {
//    returnoriginal: false
//  }).then((result) => {
//    console.log(result);
//  });
 db.collection('Users').findOneAndUpdate({
  _id: new ObjectID("5a7b00de8d61b213f468f265")
}, {
  $set: {
    name: 'Adeola'
  },
  $inc: {
    age: 1
  }
}, {
  returnoriginal: false
}).then((result) => {
  console.log(result);
});

  // db.close();
});