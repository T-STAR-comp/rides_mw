import React, { useState } from 'react';
import styles from './styles/login.module.css';

const LoginMembers = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError('');
    setSuccess(false);
    try {
      const url = import.meta.env.VITE_LOGIN_DRIVER_URL;
      if (!url) throw new Error('Login URL not configured');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || data.message || 'Login failed');
      }
      setSuccess(true);
      sessionStorage.setItem('driverLogged', data.driver.full_name);
      sessionStorage.setItem('driverEmail', formData.email);
      sessionStorage.setItem('driverPlate', data.driver.car_plate);
      sessionStorage.setItem('driverRating', data.driver.rating);
      sessionStorage.setItem('driverBalance', data.driver.balance);
      sessionStorage.setItem('driverCar', data.driver.car);
      sessionStorage.setItem('DriverKYC', data.driver.kyc_state);
      sessionStorage.setItem('driverID', data.driver.id);
      setFormData({ email: '', password: '', rememberMe: false });
      window.location.reload();
    } catch (err) {
      setApiError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login clicked`);
    alert(`${provider} login coming soon!`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.modalBackdrop} onClick={onClose} />
      
      {/* Modal Card */}
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>R</div>
            <h2 className={styles.modalTitle}>Welcome Back</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              required
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Remember me</span>
            </label>
            <a href="#forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </a>
          </div>

          {apiError && <div className={styles.errorText}>{apiError}</div>}
          {success && <div className={styles.successText}>Login successful!</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or continue with</span>
        </div>

        {/* Social Login */}
        <div className={styles.socialLogin}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => handleSocialLogin('Google')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => handleSocialLogin('Apple')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Sign Up Link */}
        <div className={styles.signupSection}>
          <p className={styles.signupText}>
            Don't have an account?{' '}
            <button
              type="button"
              className={styles.signupLink}
              onClick={onSwitchToSignup}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginMembers;