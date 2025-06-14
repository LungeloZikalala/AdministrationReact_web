import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/student-management');
    } catch (error) {
      setError('Failed to login: ' + error.message);
    }
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-container">
      <h2 className="main-title">FACE RECOGNITION ADMINISTRATION PANEL</h2>

      <div className="form-container">
        <h3>LOGIN DETAILS</h3>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
        <div className="forgot-password">
          <p><span>Forgot password?</span> <span onClick={handleForgotPasswordClick} className="forgot-password-link">Click here</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
