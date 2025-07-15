import React, { useState } from 'react';
import styles from './landing.module.css';
import { signupUser, loginUser } from './userApi';
import LoginMembers from '../members/loginMembers';
import SignupMembers from '../members/signupMembers';

const LandingPage = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [signupData, setSignupData] = useState({ fullname: '', email: '', password: '' });
  const [signupError, setSignupError] = useState({});
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Member modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleMemberLogin = () => setShowLoginModal(true);
  const handleCloseLogin = () => setShowLoginModal(false);
  const handleCloseSignup = () => setShowSignupModal(false);
  const handleSwitchToSignup = () => { setShowLoginModal(false); setShowSignupModal(true); };
  const handleSwitchToLogin = () => { setShowSignupModal(false); setShowLoginModal(true); };

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError('Please enter both email and password.');
      if (navigator.vibrate) navigator.vibrate([100]);
      return;
    }
    setLoginLoading(true);
    setLoginSuccess(false);
    try {
      const resp = await loginUser({
        email: loginData.email,
        password: loginData.password,
      });
      console.log(resp)
      setLoginSuccess(true);
      sessionStorage.setItem('userLogged',import.meta.env.VITE_LOGHASH);
      sessionStorage.setItem('userEmail', resp.user.email);
      sessionStorage.setItem('userId', resp.user.id);
      setLoginData({ email: '', password: '' });
      window.location.reload();
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      if (navigator.vibrate) navigator.vibrate([100]);
    } finally {
      setLoginLoading(false);
    }
  };

  // Signup handlers
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setSignupError((prev) => ({ ...prev, [name]: '' }));
  };

  function validatePassword(password) {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    return '';
  }

  const validateSignup = () => {
    const errors = {};
    if (!signupData.fullname.trim()) errors.fullname = 'Full name is required';
    if (!signupData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) errors.email = 'Enter a valid email';
    const passErr = validatePassword(signupData.password);
    if (passErr) errors.password = passErr;
    setSignupError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) {
      if (navigator.vibrate) navigator.vibrate([100]);
      return;
    }
    setSignupLoading(true);
    setSignupSuccess(false);
    try {
      await signupUser({
        full_name: signupData.fullname,
        email: signupData.email,
        password: signupData.password,
      });
      setSignupSuccess(true);
      setSignupData({ fullname: '', email: '', password: '' });
      setTimeout(() => {
        setShowSignup(false);
        setSignupSuccess(false);
      }, 1800);
    } catch (err) {
      setSignupError((prev) => ({ ...prev, api: err.message || 'Signup failed' }));
      if (navigator.vibrate) navigator.vibrate([100]);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>R</div>
            <span className={styles.logoText}>RidesMw</span>
          </div>
          <h1 className={styles.heroTitle}>Welcome to RidesMw</h1>
          <p className={styles.heroSubtitle}>
            Malawi's most trusted ride service. Fast, safe, and affordable rides at your fingertips.
          </p>
        </div>
        <button className={styles.membersLoginBtn} type="button" onClick={handleMemberLogin}>
          Members Login
        </button>
        <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={styles.formInput}
            value={loginData.email}
            onChange={handleLoginChange}
            autoComplete="username"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.formInput}
            value={loginData.password}
            onChange={handleLoginChange}
            autoComplete="current-password"
            required
          />
          {loginError && <div className={styles.errorText}>{loginError}</div>}
          {loginSuccess && <div className={styles.successText}>Login successful!</div>}
          <button type="submit" className={styles.loginButton} disabled={loginLoading}>
            {loginLoading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className={styles.signupPrompt}>
            Don't have an account?{' '}
            <button type="button" className={styles.signupLink} onClick={() => setShowSignup(true)}>
              Sign Up
            </button>
          </div>
        </form>
        <div className={styles.divider}>
          <span className={styles.dividerText}>or continue with</span>
        </div>
        <div className={styles.socialLogin}>
          <button type="button" className={styles.socialButton} onClick={() => alert('Google login coming soon!')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button type="button" className={styles.socialButton} onClick={() => alert('Apple login coming soon!')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>
      </section>

      {/* Signup Modal */}
      {showSignup && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowSignup(false)} />
          <div className={styles.signupModal}>
            <div className={styles.modalHeader}>
              <div className={styles.logoRow}>
                <div className={styles.logoIcon}>R</div>
                <span className={styles.logoText}>RidesMw</span>
              </div>
              <button className={styles.closeButton} onClick={() => setShowSignup(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form className={styles.signupForm} onSubmit={handleSignupSubmit}>
              <h2 className={styles.formTitle}>Create Account</h2>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className={styles.formInput}
                value={signupData.fullname}
                onChange={handleSignupChange}
                required
              />
              {signupError.fullname && <div className={styles.errorText}>{signupError.fullname}</div>}
              <input
                type="email"
                name="email"
                placeholder="Email"
                className={styles.formInput}
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
              {signupError.email && <div className={styles.errorText}>{signupError.email}</div>}
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={styles.formInput}
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
              {signupError.password && <div className={styles.errorText}>{signupError.password}</div>}
              {signupError.api && <div className={styles.errorText}>{signupError.api}</div>}
              {signupSuccess && <div className={styles.successText}>Signup successful! You can now log in.</div>}
              <div className={styles.divider}>
                <span className={styles.dividerText}>or continue with</span>
              </div>
              <div className={styles.socialLogin}>
                <button type="button" className={styles.socialButton} onClick={() => alert('Google signup coming soon!')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className={styles.socialButton} onClick={() => alert('Apple signup coming soon!')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
              <button type="submit" className={styles.signupButton} disabled={signupLoading}>
                {signupLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Member Login/Signup Modals */}
      <LoginMembers 
        isOpen={showLoginModal}
        onClose={handleCloseLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupMembers 
        isOpen={showSignupModal}
        onClose={handleCloseSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default LandingPage;