const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },

  role: { 
    type: String, 
    default: "user" 
  },

  applications: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
  ]
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
