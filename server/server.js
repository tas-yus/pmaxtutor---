const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/PMaxApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // db.collection('Courses').insertOne({
  //   name: 'chemO',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to add a course', err);
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  //
  // db.collection('Users').insertOne({
  //   name: 'สุดจิต',
  //   location: 'บางกอก'
  // }, (err, result) => {
  //   if (err) {
  //     return console.log('Unable to add a course', err);
  //   }
  //   console.log(result.ops[0]._id.getTimestamp());
  // });

  db.collection('Courses').find({completed: false}).toArray().then((docs) => {
    console.log(docs);
  }, (err) => {
    console.log('bruhh', err);
  });
});
