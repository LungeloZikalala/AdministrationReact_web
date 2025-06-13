import React, { useState } from 'react';
import './ForgotPassword.css';
import { auth } from './firebaseConfig'; // Ensure the correct path
import { sendPasswordResetEmail } from 'firebase/auth';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Email sent successfully');
      setShowPopup(true); // Show the popup when email is sent
      setTimeout(() => {
        setShowPopup(false); // Hide the popup after 3 seconds
      }, 3000);
    } catch (error) {
      setMessage('Failed to send email: ' + error.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Reset Your Password</h2>
      <p>To reset your password, enter your email address below. We will send you an email with instructions on how to reset your password.</p>
      <form onSubmit={handlePasswordReset} className="forgot-password-form">
        <div className="input-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="reset-button">Search</button>
      </form>

      {/* Popup message */}
      {showPopup && <div className="popup-message">{message}</div>}
    </div>
  );
}

export default ForgotPassword;
