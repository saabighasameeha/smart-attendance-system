import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Reports() {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPercentage, setStudentPercentage] = useState(null);

  const [absentData, setAbsentData] = useState([]);
  const [showAbsentList, setShowAbsentList] = useState(false);

  const [subjectData, setSubjectData] = useState([]);
  const [showSubjectList, setShowSubjectList] = useState(false);

  const [trendMonth, setTrendMonth] = useState("");
  const [trendData, setTrendData] = useState([]);
  const [showTrendChart, setShowTrendChart] = useState(false);

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

  const getFrequentlyAbsent = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/data/attendance/frequently-absent`);
      setAbsentData(res.data);
      setShowAbsentList(true);
    } catch (err) {
      console.error(err);
      alert("Frequently absent list load ஆகல, backend route check பண்ணுங்க");
    }
  };

  const getSubjectWise = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/data/attendance/subject-wise`);
      setSubjectData(res.data);
      setShowSubjectList(true);
    } catch (err) {
      console.error(err);
      alert("Subject-wise data load ஆகல, backend route check பண்ணுங்க");
    }
  };

  const getTrendData = async () => {
    try {
      const [year, monthNum] = trendMonth.split("-");
      const res = await axios.get(`http://localhost:5000/api/data/attendance/trend?month=${monthNum}&year=${year}`);
      setTrendData(res.data);
      setShowTrendChart(true);
    } catch (err) {
      console.error(err);
      alert("Trend data load ஆகல, backend route check பண்ணுங்க");
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

      <h3>Frequently Absent Students</h3>
      <button onClick={getFrequentlyAbsent}>Show Frequently Absent Students</button>
      {showAbsentList && (
        <ul>
          {absentData.length === 0 && <p>எந்த student-உம் absent ஆகவில்லை.</p>}
          {absentData.map((s, i) => (
            <li key={i}>
              {s.name} ({s.rollNumber}) - Absent: {s.absent} / {s.total} ({s.absentPercentage}% absent)
            </li>
          ))}
        </ul>
      )}

      <h3>Subject-wise Analysis</h3>
      <button onClick={getSubjectWise}>Show Subject-wise Attendance</button>
      {showSubjectList && (
        <ul>
          {subjectData.length === 0 && <p>Data இல்லை.</p>}
          {subjectData.map((s, i) => (
            <li key={i}>
              {s.subjectName} - {s.percentage}% (Present: {s.present} / {s.total})
            </li>
          ))}
        </ul>
      )}

      <h3>Attendance Trend Chart</h3>
      <input type="month" value={trendMonth} onChange={(e) => setTrendMonth(e.target.value)} />
      <button onClick={getTrendData}>Show Trend Chart</button>
      {showTrendChart && (
        <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
          {trendData.length === 0 ? (
            <p>இந்த மாதத்துக்கு data இல்லை.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: "Day of Month", position: "insideBottom", offset: -5 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#4CAF50" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#f44336" name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;