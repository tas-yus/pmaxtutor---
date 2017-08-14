const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Course} = require('./models/course');
const {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/courses', (req, res) => {
  var course = new Course({
    name: req.body.name
  });

  course.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/courses', (req, res) => {
  Course.find().then((courses) => {
    res.send({courses});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/courses/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Course.findById(id).then((course) => {
    if(!course) {
      return res.status(404).send();
    }

    res.send({course});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.delete('/courses/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Course.findByIdAndRemove(id).then((course) => {
    if(!course) {
      return res.status(404).send();
    }

    res.send({course});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
