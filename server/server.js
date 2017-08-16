require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const fs = require('fs');

const {mongoose} = require('./db/mongoose');
const {Course} = require('./models/course');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

hbs.registerPartials(__dirname + '/../views/partials');
app.set('view engine', 'hbs');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

/*
================================
Helper
================================
*/

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

/*
================================
Regular
================================
*/

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'Hello World!'
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page',
  });
});

app.get('/projects', (req, res) => {
  res.render('projects.hbs', {
    pageTitle: 'Projects',
  });
});

/*
================================
Login Route
================================
*/

app.post('/courses', authenticate, (req, res) => {
  var course = new Course({
    name: req.body.name,
    student: req.user._id
  });

  course.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/courses', authenticate, (req, res) => {
  Course.find({
    student: req.user._id
  }).then((courses) => {
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

app.patch('/courses/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Course.findByIdAndUpdate(id, {$set: body}, {new: true}).then((course) => {
    if(!course) {
      return res.status(404).send();
    }

    res.send({course});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
