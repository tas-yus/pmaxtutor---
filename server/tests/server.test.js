const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Course} = require('./../models/course');

const courses = [{
  _id: new ObjectID,
  name: 'chemO'
}, {
  _id: new ObjectID,
  name: 'Bruh'
}];

beforeEach((done) => {
  Course.remove({}).then(() => {
    return Course.insertMany(courses);
  }).then(() => done());
});

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

describe('GET /courses:id', () => {
  it('should return a courses', (done) => {
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
