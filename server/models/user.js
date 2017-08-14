const mongoose = require('mongoose');

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
    // Please add later features like phone username password
  }
});

module.exports = {User};
