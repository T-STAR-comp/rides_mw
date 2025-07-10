import React from 'react';
import styles from './PaymentFailed.module.css';

const PaymentFailed = ({ onRetry }) => (
  <div className={styles.failedContainer}>
    <div className={styles.iconWrapper}>
      <div className={styles.animatedCross}>
        <div className={styles.crossLine1}></div>
        <div className={styles.crossLine2}></div>
      </div>
    </div>
    <h2 className={styles.failedTitle}>Payment Failed</h2>
    <p className={styles.failedMsg}>We couldn't complete your payment.<br/>Please try again or use a different method.</p>
    {onRetry && (
      <button className={styles.retryBtn} onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

export default PaymentFailed; 