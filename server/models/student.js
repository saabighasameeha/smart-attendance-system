const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  year: { type: Number, required: true },
  section: { type: String, required: true },
  email: { type: String },
  phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);