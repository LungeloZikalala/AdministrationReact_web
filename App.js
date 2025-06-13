import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './LOGIN/Login'; // Correct path for Login component
import StudentDataManagement from './LOGIN/StudentDataManangement'; // Correct path for StudentDataManagement component
import AboutUs from './AboutUs'; // Correct path for AboutUs component
import ForgotPassword from './ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
        <Route path="/login" element={<Login />} />
        <Route path="/student-management" element={<StudentDataManagement />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;