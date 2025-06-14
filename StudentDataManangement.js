import React, { useState, useEffect } from 'react';
import './StudentDataManagement.css';
import { getDocs, collection, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { setDoc } from 'firebase/firestore';

function StudentDataManagement() {
  const [activeSection, setActiveSection] = useState('');
  const [students, setStudents] = useState([]);
  const [entryLogs, setEntryLogs] = useState([]);
  const [exitLogs, setExitLogs] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStudentNumber, setEditStudentNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editResidence, setEditResidence] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch student details from Firestore
  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const studentsCollection = collection(db, 'users');
      const studentSnapshot = await getDocs(studentsCollection);
      const studentList = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching student data: ", error);
    }
    setLoading(false);
  };

  // Modal open/close functions
  const openModal = (student) => {
    setSelectedStudent(student);
    setEditName(student.name);
    setEditStudentNumber(student.studentNumber);
    setEditEmail(student.email);
    setEditResidence(student.res);
    setIsModalOpen(true);
    console.log('Modal opened for:', student); // Debug log
};
  
  
  const closeModal = () => {
    setIsModalOpen(true);
    setSelectedStudent(null);
  };

  // Fetch history logs from Firestore
  const fetchHistoryLogs = async () => {
    setLoading(true);
    try {
      const historyCollection = collection(db, 'history');
      const historySnapshot = await getDocs(historyCollection);
      const historyList = historySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistoryLogs(historyList);
    } catch (error) {
      console.error("Error fetching history logs:", error);
    }
    setLoading(false);
  };

  // Fetch entry logs with images
  const fetchEntryLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'access_logs'), where('status', '==', 'entered'));
      const querySnapshot = await getDocs(q);
      const logs = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const log = { id: doc.id, ...doc.data() };
          log.imageUrl = await fetchStudentImage(log.student_number);
          return log;
        })
      );
      setEntryLogs(logs);
    } catch (error) {
      console.error("Error fetching entry logs:", error);
    }
    setLoading(false);
  };

  // Fetch exit logs with images
  const fetchExitLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'access_logs'), where('status', '==', 'exited'));
      const querySnapshot = await getDocs(q);
      const logs = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const log = { id: doc.id, ...doc.data() };
          log.imageUrl = await fetchStudentImage(log.student_number);
          return log;
        })
      );
      setExitLogs(logs);
    } catch (error) {
      console.error("Error fetching exit logs:", error);
    }
    setLoading(false);
  };

  // Helper function to fetch image URL for a student number
  const fetchStudentImage = async (studentNumber) => {
    const q = query(collection(db, 'users'), where('studentNumber', '==', studentNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().imageUrl;
    }
    return null;
  };


// Function to move exit logs to history if the current time is midnight and logs are older than 2 hours
const checkAndMoveToHistory = async () => {
  const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const currentTime = Date.now();
  const currentDate = new Date(currentTime);

  // Check if it's midnight (00:00)
  if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
    // Filter logs that have an exit time older than 2 hours
    const logsToMove = exitLogs.filter(log => {
      const exitTimeInMs = log.exit_time?.seconds * 1000;
      return exitTimeInMs && (currentTime - exitTimeInMs >= twoHoursInMs);
    });

    for (const log of logsToMove) {
      try {
        await setDoc(doc(db, 'history', log.id), log); // Move log to "history"
        await deleteDoc(doc(db, 'access_logs', log.id)); // Delete from "exit logs"
      } catch (error) {
        console.error("Error moving log to history:", error);
      }
    }

    fetchExitLogs(); // Refresh exit logs
  }
};

// Set interval to check every 2 hours (2 hours in milliseconds)
setInterval(checkAndMoveToHistory, 2 * 60 * 60 * 1000); // 2 hours = 7200000 ms


  // handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const handleEditSubmit = async (e) => {
      e.preventDefault(); // Prevent the default form submission
    
      const updatedStudentData = {
        name: editName,
        studentNumber: editStudentNumber,
        email: editEmail,
        res: editResidence,
        imageUrl: selectedStudent.imageUrl, // Keep the same image URL
      };
    
      try {
        if (selectedStudent.studentNumber !== editStudentNumber) {
          // Handle case where student number is changing
          await setDoc(doc(db, 'users', editStudentNumber), updatedStudentData);
          await deleteDoc(doc(db, 'users', selectedStudent.id)); // Delete the old document
    
        } else {
          // If student number hasn't changed, update the existing document by `selectedStudent.id`
          await setDoc(doc(db, 'users', selectedStudent.id), updatedStudentData, { merge: true });
        }
    
        fetchStudentDetails(); // Refresh the list after editing
        closeModal(); // Close the modal
      } catch (error) {
        console.error("Error updating student:", error);
      }
};
  } 

  useEffect(() => {
    const interval = setInterval(checkAndMoveToHistory, 10 * 1000); // Check every 10 seconds for testing
    return () => clearInterval(interval); // Clear interval on unmount
  }, [exitLogs]);

  // Button click handlers
  const handleStudentDetailsClick = () => {
    setActiveSection('students');
    fetchStudentDetails();
  };
  
  const handleEntryDetailsClick = () => {
    setActiveSection('entry');
    fetchEntryLogs();
  };
  
  const handleExitDetailsClick = () => {
    setActiveSection('exit');
    fetchExitLogs();
  };
  
  const handleHistoryClick = () => {
    setActiveSection('history');
    fetchHistoryLogs();
  };

  // Delete a student
  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
      fetchStudentDetails();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Handle student click (only for "Registered Students" section)
  const handleStudentClick = (student) => {
    if (activeSection === 'students') {
      setSelectedStudent(student);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // Handle About Us redirection
  const handleAboutUs = () => {
    navigate('/aboutus');
  };

  // Render content based on active section
  const renderContent = () => {
    if (activeSection === 'students') {
      if (loading) return <div>Loading student details...</div>;
      if (students.length === 0) return <div>No students registered yet.</div>;

      return (
        <div>
          <h3>Registered Students</h3>
          <div className="student-list">
            {students.map((student) => (
              <div key={student.id} className="student-card" onClick={() => handleStudentClick(student)}>
                <img src={student.imageUrl} alt={student.name} className="student-image" />
                <div className="student-details">
                  <p><strong>Name:</strong> {student.name}</p>
                  <p><strong>Student Number:</strong> {student.studentNumber}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Residence:</strong> {student.res}</p>
                </div>
                <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (activeSection === 'entry') {
      return (
        <div>
          <h3>Entry Details</h3>
          {loading ? (
            <div>Loading entry details...</div>
          ) : (
            <div className="student-list">
              {entryLogs.map((log) => (
                <div key={log.id} className="student-card">
                  <img src={log.imageUrl || '/default-avatar.png'} alt={log.name} className="student-image" />
                  <div className="student-details">
                    <p><strong>Name:</strong> {log.name}</p>
                    <p><strong>Student Number:</strong> {log.student_number}</p>
                    <p><strong>Entry Time:</strong> {log.entry_time && new Date(log.entry_time.seconds * 1000).toLocaleString()}</p>
                    <p><strong>Status:</strong> {log.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (activeSection === 'exit') {
      return (
        <div>
          <h3>Exit Details</h3>
          {loading ? (
            <div>Loading exit details...</div>
          ) : (
            <div className="student-list">
              {exitLogs.map((log) => (
                <div key={log.id} className="student-card">
                  <img src={log.imageUrl || '/default-avatar.png'} alt={log.name} className="student-image" />
                  <div className="student-details">
                    <p><strong>Name:</strong> {log.name}</p>
                    <p><strong>Student Number:</strong> {log.student_number}</p>
                    <p><strong>Exit Time:</strong> {log.exit_time ? 
                (log.exit_time.seconds 
                  ? new Date(log.exit_time.seconds * 1000).toLocaleString() 
                  : new Date(log.exit_time).toLocaleString()
                ) 
                : 'N/A'}
            </p>
                    <p><strong>Status:</strong> {log.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    } else if (activeSection === 'history') {
        return (
          <div>
            <h3>History Logs</h3>
            {loading ? (
              <div>Loading history logs...</div>
            ) : (
              <div className="student-list">
                {historyLogs.length > 0 ? (
                  historyLogs.map((log) => (
                    <div key={log.id} className="student-card">
                      <img src={log.imageUrl || '/default-avatar.png'} alt={log.name} className="student-image" />
                      <div className="student-details">
                        <p><strong>Name:</strong> {log.name}</p>
                        <p><strong>Student Number:</strong> {log.student_number}</p>
                        <p><strong>Entry Time:</strong> {log.entry_time && new Date(log.entry_time.seconds * 1000).toLocaleString()}</p>
                        <p><strong>Exit Time:</strong> {log.exit_time && new Date(log.exit_time.seconds * 1000).toLocaleString()}</p>
                        <p><strong>Duration:</strong> {log.duration}</p>
                        <p><strong>Status:</strong> {log.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No history logs available.</div>
                )}
              </div>
            )}
          </div>
        );
    
    } else {
      return <div>Select a section to view details</div>;
    }
  };

  return (
    <div className="student-data-management-container">
      <div className="sidebar">
        <div className="logo">
          <img src="/zululand.png" alt="UNIZULU Logo" className="logo-image" />
        </div>
        <div className="sidebar-menu">
          <button className="menu-button" onClick={handleAboutUs}>ABOUT US</button>
          <button className="menu-button logout-button" onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <h2>STUDENT DATA MANAGEMENT</h2>
        </div>
        <div className="button-panel">
          <button onClick={handleStudentDetailsClick}>Students Details</button>
          <button onClick={handleEntryDetailsClick}>Entry Details</button>
          <button onClick={handleExitDetailsClick}>Exit Details</button>
          <button onClick={handleHistoryClick}>HISTORY</button>
        </div>
        <div className="content-area">
          {renderContent()}
        </div>
      </div>

      {isModalOpen && selectedStudent && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content-image" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={closeModal}>X</button>
      <div className="modal-content-container">
        <img src={selectedStudent.imageUrl} alt={selectedStudent.name} className="modal-image" />
        <form className="edit-form" onSubmit={handleEditSubmit}>
          <div className="form-row">
            <label>
              Name:
              <input
                type="text"
                value={editName ?? selectedStudent.name} // Show saved name as default
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Student Number:
              <input
                type="text"
                value={editStudentNumber ?? selectedStudent.studentNumber} // Show saved student number as default
                onChange={(e) => setEditStudentNumber(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email:
              <input
                type="email"
                value={editEmail ?? selectedStudent.email} // Show saved email as default
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Residence:
              <input
                type="text"
                value={editResidence ?? selectedStudent.residence} // Show saved residence as default
                onChange={(e) => setEditResidence(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  </div>
)}




    </div> 
  );
}

export default StudentDataManagement;
