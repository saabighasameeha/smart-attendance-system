const express = require('express');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const router = express.Router();

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students by department, year, section
router.get('/students', async (req, res) => {
  try {
    const { department, year, section } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (year) filter.year = year;
    if (section) filter.section = section;

    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save attendance (bulk - multiple students at once)
router.post('/attendance/mark', async (req, res) => {
  try {
    const { records } = req.body;
    const saved = await Attendance.insertMany(records);
    res.status(201).json({ message: 'Attendance saved successfully', count: saved.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by student
router.get('/attendance/student/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance percentage for a student
router.get('/attendance/percentage/:studentId', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId });
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    res.json({ total, present, absent: total - present, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily report - all attendance for a specific date
router.get('/attendance/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('student', 'name rollNumber');

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;