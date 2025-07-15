import React from 'react';
import styles from './offline.module.css';

const Offline = ({ onRetry }) => (
  <div className={styles.offlineContainer}>
    <div className={styles.illustration}>
      {/* Simple SVG illustration for offline */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" fill="#FFF3E0" stroke="#FF6B35" strokeWidth="4"/>
        <path d="M40 80c5-8 15-12 20-12s15 4 20 12" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <ellipse cx="60" cy="60" rx="28" ry="18" fill="#FF8A65" opacity="0.15"/>
        <rect x="48" y="48" width="24" height="16" rx="4" fill="#FF6B35"/>
        <rect x="54" y="54" width="12" height="4" rx="2" fill="#fff"/>
      </svg>
    </div>
    <h2 className={styles.title}>You’re Offline</h2>
    <p className={styles.subtitle}>No internet connection detected.<br/>Please check your connection and try again.</p>
    <button className={styles.retryBtn} onClick={onRetry}>Retry</button>
  </div>
);

export default Offline; 