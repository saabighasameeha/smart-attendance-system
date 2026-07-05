import { useState } from "react";
import axios from "axios";

function Reports() {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPercentage, setStudentPercentage] = useState(null);

  const getDailyReport = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/data/attendance/daily?date=${date}`);
      setDailyData(res.data);
    } catch (err) {
      console.error(err);
      alert("Daily report load ஆகல, backend route check பண்ணுங்க");
    }
  };

  const getMonthlyReport = async () => {
    try {
      const [year, monthNum] = month.split("-");
      const res = await axios.get(`http://localhost:5000/api/data/attendance/monthly?month=${monthNum}&year=${year}`);
      setMonthlyData(res.data);
    } catch (err) {
      console.error(err);
      alert("Monthly report load ஆகல, backend route check பண்ணுங்க");
    }
  };

  const exportMonthlyExcel = () => {
    const [year, monthNum] = month.split("-");
    window.open(`http://localhost:5000/api/data/attendance/monthly/export?month=${monthNum}&year=${year}`, "_blank");
  };

  const searchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/data/students/search?query=${searchQuery}`);
      setSearchResults(res.data);
      setSelectedStudent(null);
      setStudentPercentage(null);
    } catch (err) {
      console.error(err);
      alert("Search ஆகல, backend route check பண்ணுங்க");
    }
  };

  const viewStudentPercentage = async (student) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/data/attendance/percentage/${student._id}`);
      setSelectedStudent(student);
      setStudentPercentage(res.data);
    } catch (err) {
      console.error(err);
      alert("Student percentage load ஆகல");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Attendance Reports</h2>

      <h3>Daily Report</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={getDailyReport}>Get Daily Report</button>
      <ul>
        {dailyData.map((item, i) => (
          <li key={i}>{item.student?.name} ({item.student?.rollNumber}) - {item.status}</li>
        ))}
      </ul>

      <h3>Monthly Report</h3>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      <button onClick={getMonthlyReport}>Get Monthly Report</button>
      {monthlyData.length > 0 && (
        <button onClick={exportMonthlyExcel} style={{ marginLeft: "10px" }}>
          Export Excel
        </button>
      )}
      <ul>
        {monthlyData.map((item, i) => (
          <li
            key={i}
            style={{
              color: item.percentage < 80 ? "red" : "inherit",
              fontWeight: item.percentage < 80 ? "bold" : "normal",
            }}
          >
            {item.name} ({item.rollNumber}) - {item.percentage}%
            {item.percentage < 80 && <span> ⚠️ Shortage</span>}
          </li>
        ))}
      </ul>

      <h3>Student Search</h3>
      <input
        type="text"
        placeholder="Name or Roll Number"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={searchStudents}>Search</button>
      <ul>
        {searchResults.map((s) => (
          <li key={s._id}>
            {s.name} ({s.rollNumber})
            <button onClick={() => viewStudentPercentage(s)} style={{ marginLeft: "10px" }}>
              View Attendance %
            </button>
          </li>
        ))}
      </ul>

      {selectedStudent && studentPercentage && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc" }}>
          <strong>{selectedStudent.name} ({selectedStudent.rollNumber})</strong>
          <p>Total Classes: {studentPercentage.total}</p>
          <p>Present: {studentPercentage.present}</p>
          <p>Absent: {studentPercentage.absent}</p>
          <p>Percentage: {studentPercentage.percentage}%</p>
        </div>
      )}
    </div>
  );
}

export default Reports;