const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Course} = require('./../models/course');

beforeEach((done) => {
  Course.remove({}).then(() => done());
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

        Course.find().then((courses) => {
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
            expect(courses.length).toBe(0);
            done();
          }).catch((e) => done(e));
        })
  });
});
