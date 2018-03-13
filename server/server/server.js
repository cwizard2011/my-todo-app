require('./config/config')

const _= require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fileSystem = require('fs');

const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Todo, Task} = require('./models/todo');
const {Upload} = require('./models/upload')
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');
const {cloud} = require('../cloudfile')
const cloudinary = require('cloudinary');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//upload image to cloudinary;

let upload = multer({ dest : './uploads/image'}).single('userPhoto');
app.use(express.static(__dirname + '/uploads'));

app.post('/api/v1/photo', authenticate, (req,res) => {
	upload(req, res, (err) => {		
    if(err) { 
      return res.end("Error");
    };
		console.log(req);
		res.end("file uploaded");

    cloudinary.config({ 
	      cloud_name: cloud.name, 
	      api_key: cloud.key, 
	      api_secret: cloud.secret
	    });
      let imageFile = 'https://pre00.deviantart.net/b72b/th/pre/f/2016/063/a/6/logo_by_maxigamer-d9tx6iz.png';
    cloudinary.v2.uploader.upload(imageFile,
      { width: 300, height: 300, crop: "limit", tags: req.body.tags, moderation:'manual' },
       (err, result) => { 
        //create an urembo product
        let photo = new Upload({
          title: req.body.title,
          description: req.body.description,
          created_at: new Date(),
          image: result.url,
          image_id: result.public_id
        });
          
        //save the product and check for errors
        photo.save( (err) => {
          if(err) {
            res.send(err);
          }
          res.end();
        });
    });

   });	
});

app.get('/api/v1/photo', authenticate, (req, res) => {
     Upload.find(( err, photos) => {
     	if(err){
        res.send(err);
       }	
       console.log(photos)
     	res.json(photos);
     });
});

// image upload end

app.post('/api/v1/todos', authenticate, (req, res) => {
 let todo = new Todo({
  text: req.body.text,
  _creator: req.user._id
 });
 todo.save().then((doc) => {
  res.send(doc);
 }, (e) => {
  res.status(400).send(e)
 });
});

app.get('/api/v1/todos', authenticate, (req, res) => {
  Todo.find({
    _creator:req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e)
  });
});

app.get('/api/v1/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    Todo.findOne({
      _id: id,
      _creator: req.user._id
    }).then((todo) => {
      if(!todo) {
       return res.status(404).send()
      }
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
});

app.delete('/api/v1/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo})
  } catch (e) {
    res.status(400).send
  }
})

app.patch('/api/v1/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator:req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/api/v1/todos/:id/tasks', authenticate, (req, res) => {
  let task = new Task({
   text: req.body.text,
   _creator: req.user._id,
   priority: req.body.priority
  });
  task.save().then((doc) => {
   res.send(doc);
  }, (e) => {
   res.status(400).send(e)
  });
 });

 app.get('/api/v1/todos/:id/tasks', authenticate, (req, res) => {
  Task.find({
    _creator:req.user._id
  }).then((tasks) => {
    res.send({tasks});
  }, (e) => {
    res.status(400).send(e)
  });
});

app.get('/api/v1/todos/:id/tasks/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    Task.findOne({
      _id: id,
      _creator: req.user._id
    }).then((task) => {
      if(!task) {
       return res.status(404).send()
      }
      res.send({task});
    }).catch((e) => {
      res.status(400).send();
    });
});

app.delete('/api/v1/todos/:id/tasks/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const task = await Task.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }

    res.send({task})
  } catch (e) {
    res.status(400).send
  }
})


app.patch('/api/v1/todos/:id/tasks/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed', 'priority']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Task.findOneAndUpdate({_id: id, _creator:req.user._id}, {$set: body}, {new: true}).then((task) => {
    if(!task) {
      return res.status(404).send();
    }

    res.send({task});
  }).catch((e) => {
    res.status(400).send();
  });
});


app.post('/api/v1/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password', 'userName']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user)
  } catch (e) {
    res.status(400).send(e)
  }
});

app.get('/api/v1/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/api/v1/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user)
  } catch (e) {
    res.status(400).send()
  }
});

app.delete('/api/v1/users/me/token', authenticate, async (req, res) => {
  try{
    await req.user.removeToken(req.token)
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
})


app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};