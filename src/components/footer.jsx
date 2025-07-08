import React, { useState } from 'react';
import styles from './componentStyles.footer.module.css';
import LoginMembers from '../members/loginMembers';
import SignupMembers from '../members/signupMembers';

const Footer = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleMemberLogin = () => {
    setShowLoginModal(true);
  };

  const handleDriverLogin = () => {
    setShowLoginModal(true);
  };

  const handleCloseLogin = () => {
    setShowLoginModal(false);
  };

  const handleCloseSignup = () => {
    setShowSignupModal(false);
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* Main Footer Sections */}
          <div className={styles.footerMain}>
            {/* Company Info */}
            <div className={styles.footerSection}>
              <div className={styles.logoSection}>
                <div className={styles.logoIcon}>R</div>
                <h3 className={styles.logoText}>RidesMw</h3>
              </div>
              <p className={styles.companyDescription}>
                Revolutionizing transportation in Malawi with cutting-edge technology 
                and a commitment to safety, reliability, and community.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                  </svg>
                </a>
                <a href="#" className={styles.socialLink} aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#features" className={styles.footerLink}>Features</a></li>
                <li><a href="#about" className={styles.footerLink}>About Us</a></li>
                <li><a href="#safety" className={styles.footerLink}>Safety</a></li>
                <li><a href="#support" className={styles.footerLink}>Support</a></li>
                <li><a href="#careers" className={styles.footerLink}>Careers</a></li>
                <li><a href="#press" className={styles.footerLink}>Press</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Services</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#economy" className={styles.footerLink}>Economy Rides</a></li>
                <li><a href="#comfort" className={styles.footerLink}>Comfort Rides</a></li>
                <li><a href="#premium" className={styles.footerLink}>Premium Rides</a></li>
                <li><a href="#business" className={styles.footerLink}>Business Travel</a></li>
                <li><a href="#airport" className={styles.footerLink}>Airport Transfers</a></li>
                <li><a href="#events" className={styles.footerLink}>Event Transportation</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className={styles.footerSection}>
              <h4 className={styles.sectionTitle}>Contact Us</h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.contactIcon}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Lilongwe, Malawi</span>
                </div>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.contactIcon}>
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span>+265 1 234 567</span>
                </div>
                <div className={styles.contactItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.contactIcon}>
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>hello@ridesmw.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Login Section */}
          <div className={styles.memberSection}>
            <div className={styles.memberContent}>
              <div className={styles.memberInfo}>
                <h3 className={styles.memberTitle}>Join RidesMw Community</h3>
                <p className={styles.memberDescription}>
                  Access exclusive features, earn rewards, and enjoy priority support as a RidesMw member.
                </p>
              </div>
              <div className={styles.memberActions}>
                <button 
                  className={styles.memberLoginBtn}
                  onClick={handleMemberLogin}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.loginIcon}>
                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                  </svg>
                  Login as Member
                </button>
                <button 
                  className={styles.driverLoginBtn}
                  onClick={handleDriverLogin}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.driverIcon}>
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                  Driver Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <p>&copy; 2024 RidesMw. All rights reserved.</p>
            </div>
            <div className={styles.legalLinks}>
              <a href="#privacy" className={styles.legalLink}>Privacy Policy</a>
              <a href="#terms" className={styles.legalLink}>Terms of Service</a>
              <a href="#cookies" className={styles.legalLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginMembers 
        isOpen={showLoginModal}
        onClose={handleCloseLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />

      {/* Signup Modal */}
      <SignupMembers 
        isOpen={showSignupModal}
        onClose={handleCloseSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default Footer;
