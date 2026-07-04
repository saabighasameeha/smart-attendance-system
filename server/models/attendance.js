const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  date: { type: Date, required: true },
  period: { type: Number, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);