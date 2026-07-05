const express = require('express');
const ExcelJS = require('exceljs');
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

// Search student by name or roll number
router.get('/students/search', async (req, res) => {
  try {
    const { query } = req.query;
    const students = await Student.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { rollNumber: { $regex: query, $options: 'i' } }
      ]
    });
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

// Monthly report - attendance percentage for all students in a month
router.get('/attendance/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('student', 'name rollNumber');

    const grouped = {};
    records.forEach(r => {
      const id = r.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          name: r.student.name,
          rollNumber: r.student.rollNumber,
          total: 0,
          present: 0
        };
      }
      grouped[id].total += 1;
      if (r.status === 'Present') grouped[id].present += 1;
    });

    const report = Object.values(grouped).map(s => ({
      ...s,
      percentage: ((s.present / s.total) * 100).toFixed(2)
    }));

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export monthly report as Excel file
router.get('/attendance/monthly/export', async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('student', 'name rollNumber');

    const grouped = {};
    records.forEach(r => {
      const id = r.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          name: r.student.name,
          rollNumber: r.student.rollNumber,
          total: 0,
          present: 0
        };
      }
      grouped[id].total += 1;
      if (r.status === 'Present') grouped[id].present += 1;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Monthly Report');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Total Classes', key: 'total', width: 15 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Percentage', key: 'percentage', width: 12 }
    ];

    Object.values(grouped).forEach(s => {
      sheet.addRow({
        name: s.name,
        rollNumber: s.rollNumber,
        total: s.total,
        present: s.present,
        percentage: ((s.present / s.total) * 100).toFixed(2) + '%'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=monthly_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Frequently absent students (overall, across all records)
router.get('/attendance/frequently-absent', async (req, res) => {
  try {
    const records = await Attendance.find().populate('student', 'name rollNumber');

    const grouped = {};
    records.forEach(r => {
      if (!r.student) return;
      const id = r.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          name: r.student.name,
          rollNumber: r.student.rollNumber,
          total: 0,
          absent: 0
        };
      }
      grouped[id].total += 1;
      if (r.status === 'Absent') grouped[id].absent += 1;
    });

    const result = Object.values(grouped)
      .map(s => ({
        ...s,
        absentPercentage: s.total > 0 ? ((s.absent / s.total) * 100).toFixed(2) : 0
      }))
      .filter(s => s.absent > 0)
      .sort((a, b) => b.absent - a.absent);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subject-wise attendance analysis
router.get('/attendance/subject-wise', async (req, res) => {
  try {
    const records = await Attendance.find().populate('subject', 'name');

    const grouped = {};
    records.forEach(r => {
      if (!r.subject) return;
      const id = r.subject._id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          subjectName: r.subject.name,
          total: 0,
          present: 0
        };
      }
      grouped[id].total += 1;
      if (r.status === 'Present') grouped[id].present += 1;
    });

    const result = Object.values(grouped).map(s => ({
      ...s,
      percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance trend - day-by-day present/absent count for a month
router.get('/attendance/trend', async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end }
    });

    const grouped = {};
    records.forEach(r => {
      const day = new Date(r.date).getDate();
      if (!grouped[day]) {
        grouped[day] = { day, present: 0, absent: 0 };
      }
      if (r.status === 'Present') grouped[day].present += 1;
      else grouped[day].absent += 1;
    });

    const result = Object.values(grouped).sort((a, b) => a.day - b.day);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;