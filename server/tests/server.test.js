const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Course} = require('./../models/course');
const {User} = require('./../models/user');
const {courses, users, populateUsers, populateCourses} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateCourses);

describe('POST /courses', () => {
  it('should add a new course', (done) => {
    var name = 'hello';

    request(app)
      .post('/courses')
      .send({name})
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Course.find({name}).then((courses) => {
          expect(courses.length).toBe(1);
          expect(courses[0].name).toBe(name);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a course with invalid body data', (done) => {
      request(app)
        .post('/courses')
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Course.find().then((courses) => {
            expect(courses.length).toBe(2);
            done();
          }).catch((e) => done(e));
        })
  });
});

describe('GET /courses', () => {
  it('should return all courses', (done) => {
    request(app)
      .get('/courses')
      .expect(200)
      .expect((res) => {
        expect(res.body.courses.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /courses/:id', () => {
  it('should return a course', (done) => {
    request(app)
      .get(`/courses/${courses[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.course.name).toBe(courses[0].name);
      })
      .end(done);
  });

  it('should return 404 if a course not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/courses/${hexId}`)
      .expect(404)
      .end(done)
  });

  it('should return 404 for a non object id', (done) => {
    request(app)
      .get('/courses/123')
      .expect(404)
      .end(done)
  })
});

describe('DELETE /courses/:id', () => {
  it('should delete a course', (done) => {
    var hexId = courses[1]._id.toHexString();

    request(app)
      .delete(`/courses/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.course._id).toBe(hexId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Course.findById(hexId).then((course) => {
          expect(course).toNotExist();
          done();
        }).catch((e) => done());
      });
  });

  it('should return 404 if a course not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/courses/${hexId}`)
      .expect(404)
      .end(done)
  });

  it('should return 404 for a non object id', (done) => {
    request(app)
      .delete('/courses/123')
      .expect(404)
      .end(done)
  });
});

describe('PATCH /courses/:id', () => {
  it('should update the course', (done) => {
      var hexId = courses[0]._id.toHexString();
      var name = 'chemOLAA'

      request(app)
        .patch(`/courses/${hexId}`)
        .send({
          completed: true,
          name
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.course.name).toBe(name);
          expect(res.body.course.completed).toBe(true);
          expect(res.body.course.completedAt).toBeA('number');
        })
        .end(done)
  });

  it('should clear completedAt when course is not completed', (done) => {
      var hexId = courses[1]._id.toHexString();
      var name = 'Hello';

      request(app)
        .patch(`/courses/${hexId}`)
        .send({
          completed: false,
          name
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.course.name).toBe(name);
          expect(res.body.course.completed).toBe(false);
          expect(res.body.course.completedAt).toNotExist();
        })
        .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'lol@l.com'
    var password = '123mbroe'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user.email).toBe(email);
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done());
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'l';
    var password = '123mbroe';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    var email = 'l';
    var password = '123mbroe';
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});
