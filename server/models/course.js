const COURSE_LIFE = 7776000000;
const mongoose = require('mongoose');

var Course = mongoose.model('Course', {
  name: {
    type: String,
    required: true,
    // add lists of possible courses and the name has to match
    minlength: '1',
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  expiredAt: {
    type: Number,
    default: new Date().getTime() + COURSE_LIFE
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Course};
