const {MongoClient, ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Course} = require('./models/course');
const {User} = require('./models/user');

var app = express();

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

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};
