import React, { useState } from 'react';
import '../styles/login.css';

const AuthForm: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const handleSignUpClick = () => {
    setIsActive(true);
  };

  const handleSignInClick = () => {
    setIsActive(false);
  };

  return (
    <div className="auth-container">
      <div className={`container ${isActive ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <form action="#">
             <div className="form-header">
                <h1>Create Account</h1>
                </div>
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form action="#">
            <div className="form-header">
              <h1>Sign in</h1>
            </div>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forgot your password?</a>
            <button>Sign In</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="panel-content">
                <div className="panel-header">
                  <h1 id='first-h'>Welcome Back!</h1>
                </div>
                <div className="panel-text">
                  <p id='first-p'>To keep connected with us please login with your personal info</p>
                </div>
                
                <button className="ghost" id='first-btn' onClick={handleSignInClick}>Sign In</button>
              </div>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="panel-content">
                <div className="panel-header">
                  <h1 id='second-h'>Hello!</h1>
                </div>
                <div className="panel-text">
                  <p id='second-p'>Enter your personal details and start journey with us</p>
                </div>
                <button className="ghost" id='second-btn' onClick={handleSignUpClick}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer></footer>
    </div>
  );
};

export default AuthForm;