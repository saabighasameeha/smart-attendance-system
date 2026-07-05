import { useState, useEffect } from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [facultyName, setFacultyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saveMessage, setSaveMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setFacultyName(data.faculty.name);
        setLoggedIn(true);
      } else {
        setLoginMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginMessage('Error connecting to server');
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetch('http://localhost:5000/api/data/students')
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(() => setSaveMessage('Failed to load students'));
    }
  }, [loggedIn]);

  const markStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const records = students
      .filter(s => attendance[s._id])
      .map(s => ({
        student: s._id,
        subject: '6a4916f9aea9b0931d62adae',
        faculty: '6a48fc48f954e51b032a0b44',
        date: new Date().toISOString(),
        period: 1,
        status: attendance[s._id],
      }));

    if (records.length === 0) {
      setSaveMessage('Please mark attendance for at least one student');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/data/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage(`Attendance saved for ${data.count} student(s)!`);
      } else {
        setSaveMessage(data.message || 'Failed to save');
      }
    } catch (err) {
      setSaveMessage('Error connecting to server');
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '300px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Faculty Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Login
          </button>
          {loginMessage && <p style={{ marginTop: '1rem', textAlign: 'center', color: 'red' }}>{loginMessage}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Welcome, {facultyName}</h2>
      <h3 style={{ textAlign: 'center' }}>Mark Attendance</h3>

      {students.length === 0 && <p style={{ textAlign: 'center' }}>Loading students...</p>}

      {students.map(s => (
        <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
          <span>{s.name} ({s.rollNumber})</span>
          <div>
            <button
              onClick={() => markStatus(s._id, 'Present')}
              style={{ marginRight: '8px', padding: '6px 12px', background: attendance[s._id] === 'Present' ? '#4CAF50' : '#ddd', color: attendance[s._id] === 'Present' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Present
            </button>
            <button
              onClick={() => markStatus(s._id, 'Absent')}
              style={{ padding: '6px 12px', background: attendance[s._id] === 'Absent' ? '#f44336' : '#ddd', color: attendance[s._id] === 'Absent' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Absent
            </button>
          </div>
        </div>
      ))}

      {students.length > 0 && (
        <button
          onClick={handleSave}
          style={{ width: '100%', marginTop: '1.5rem', padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          Save Attendance
        </button>
      )}

      {saveMessage && <p style={{ textAlign: 'center', marginTop: '1rem', color: saveMessage.includes('saved') ? 'green' : 'red' }}>{saveMessage}</p>}
    </div>
  );
}

export default App;