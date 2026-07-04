import { useState, useEffect } from 'react';

function App() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/data/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => setMessage('Failed to load students'));
  }, []);

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
      setMessage('Please mark attendance for at least one student');
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
        setMessage(`Attendance saved for ${data.count} student(s)!`);
      } else {
        setMessage(data.message || 'Failed to save');
      }
    } catch (err) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>Mark Attendance</h2>

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

      {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: message.includes('saved') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default App;