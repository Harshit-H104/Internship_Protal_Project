const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // ✅ FIXED (formData nahi, User hoga)
    required: true
  },
  company: String,
  role: String,
  location: {
    office: String,
    stipend: String
  },
  phone: String,
  email: String,
  resumeLink: String
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
