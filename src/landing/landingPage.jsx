import React, { useState } from 'react';
import styles from './landing.module.css';
import Footer from '../components/footer';
import { signupUser, loginUser } from './userApi';

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
    if (!validateSignup()) return;
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
              <button type="submit" className={styles.signupButton} disabled={signupLoading}>
                {signupLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;