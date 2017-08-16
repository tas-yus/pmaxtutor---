const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Course} = require('./../../models/course');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const courses = [{
  _id: new ObjectID,
  name: 'chemO',
  student: userOneId
}, {
  _id: new ObjectID,
  name: 'Bruh',
  completed: true,
  completed: 333,
  student: userTwoId
}];

const users = [{
  _id: userOneId,
  email: 'tas@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'lol@s.com',
  password: 'userTwoPass'
}];

const populateCourses = (done) => {
  Course.remove({}).then(() => {
    return Course.insertMany(courses);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
  }).then(() => done());
}

module.exports = {courses, users, populateCourses, populateUsers};
