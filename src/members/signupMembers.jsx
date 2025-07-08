import React, { useState } from 'react';
import styles from './styles.signup.module.css';

const SignupMembers = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    carPlate: '',
    carType: '',
    vehicleType: '',
    driverLicense: null,
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.carPlate.trim()) {
      newErrors.carPlate = 'Car plate number is required';
    } else if (!/^[A-Z]{2}\s\d{4}$/.test(formData.carPlate.trim())) {
      newErrors.carPlate = 'Please enter a valid plate number (e.g., MW 1234)';
    }
    
    if (!formData.carType.trim()) {
      newErrors.carType = 'Car type is required';
    }
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
    }
    
    if (!formData.driverLicense) {
      newErrors.driverLicense = 'Driver license is required';
    } else if (formData.driverLicense.size > 5 * 1024 * 1024) { // 5MB limit
      newErrors.driverLicense = 'File size must be less than 5MB';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please agree to the terms and conditions';
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
      const url = import.meta.env.VITE_SIGNUP_DRIVER_URL;
      if (!url) throw new Error('Signup URL not configured');
      const form = new FormData();
      form.append('full_name', `${formData.firstName.trim()} ${formData.lastName.trim()}`);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('car_plate', formData.carPlate);
      form.append('car_type', formData.carType);
      form.append('vehicle_type', formData.vehicleType);
      form.append('id_document', formData.driverLicense);
      const res = await fetch(url, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || data.message || 'Signup failed');
      }
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        carPlate: '',
        carType: '',
        vehicleType: '',
        driverLicense: null,
        agreeToTerms: false
      });
    } catch (err) {
      setApiError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`${provider} signup clicked`);
    alert(`${provider} signup coming soon!`);
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
            <h2 className={styles.modalTitle}>Create Account</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.firstName ? styles.error : ''}`}
                placeholder="Enter first name"
                required
              />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.lastName ? styles.error : ''}`}
                placeholder="Enter last name"
                required
              />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
            </div>
          </div>

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
              placeholder="Create a password"
              required
            />
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Car Plate Number</label>
            <input
              type="text"
              name="carPlate"
              value={formData.carPlate}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.carPlate ? styles.error : ''}`}
              placeholder="e.g., MW 1234"
              required
            />
            {errors.carPlate && <span className={styles.errorText}>{errors.carPlate}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Car Type</label>
            <input
              type="text"
              name="carType"
              value={formData.carType}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.carType ? styles.error : ''}`}
              placeholder="e.g., Toyota Corolla, Honda Fit"
              required
            />
            {errors.carType && <span className={styles.errorText}>{errors.carType}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className={`${styles.formInput} ${errors.vehicleType ? styles.error : ''}`}
              required
            >
              <option value="">Select vehicle type</option>
              <option value="economy">Economy</option>
              <option value="classic">Classic</option>
              <option value="luxury">Luxury</option>
            </select>
            {errors.vehicleType && <span className={styles.errorText}>{errors.vehicleType}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Driver's License</label>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                name="driverLicense"
                onChange={handleInputChange}
                accept="image/*,.pdf"
                className={styles.fileInput}
                required
              />
              <div className={styles.fileUploadArea}>
                <div className={styles.fileUploadIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className={styles.fileUploadText}>
                  {formData.driverLicense ? (
                    <>
                      <span className={styles.fileName}>{formData.driverLicense.name}</span>
                      <span className={styles.fileSize}>
                        ({(formData.driverLicense.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.uploadText}>Click to upload driver's license</span>
                      <span className={styles.uploadSubtext}>Image files up to 5MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {errors.driverLicense && <span className={styles.errorText}>{errors.driverLicense}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                I agree to the{' '}
                <a href="#terms" className={styles.termsLink}>Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" className={styles.termsLink}>Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <span className={styles.errorText}>{errors.agreeToTerms}</span>}
          </div>

          {apiError && <div className={styles.errorText}>{apiError}</div>}
          {success && <div className={styles.successText}>Signup successful! You can now log in.</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or sign up with</span>
        </div>

        {/* Social Signup */}
        <div className={styles.socialSignup}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => handleSocialSignup('Google')}
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
            onClick={() => handleSocialSignup('Apple')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Login Link */}
        <div className={styles.loginSection}>
          <p className={styles.loginText}>
            Already have an account?{' '}
            <button
              type="button"
              className={styles.loginLink}
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupMembers;