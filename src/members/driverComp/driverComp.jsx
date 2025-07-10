import React, { useState, useEffect } from 'react';
import styles from './styles/driverComp.module.css';
import { postDriverLocation } from './driverLocationApi';
import { connectRideSocket } from '../../Home/rideSocket';
import { postDriverResponse } from './driverResponseApi';
import MapModal from '../../components/MapModal';

const DriverComp = () => {
  const [driverData, setDriverData] = useState({
    name: sessionStorage.getItem('driverLogged'),
    balance: parseFloat(sessionStorage.getItem('driverBalance')),
    rating: sessionStorage.getItem('driverRating'),
    totalRides: null,
    vehicle: sessionStorage.getItem('driverCar'),
    plate: sessionStorage.getItem('driverPlate')
  });

  const [newPickups, setNewPickups] = useState([]);
  const [pickupHistory, setPickupHistory] = useState([]);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    rate: 0,
    vehicleType: 'economy',
  });
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalOrigin, setMapModalOrigin] = useState(null);
  const [mapModalDestination, setMapModalDestination] = useState(null);
  const [mapModalTitle, setMapModalTitle] = useState('');

  const handleAcceptRide = async (rideId) => {
    setLoadingBookingId(rideId);
    try {
      await postDriverResponse({ id: rideId, status: 'inprogress' });
      setNewPickups(prev => prev.map(ride => ride.id === rideId ? { ...ride, status: 'inprogress' } : ride));
    } catch (err) {
      // Optionally show error to user
    }
    setLoadingBookingId(null);
  };

  const handleCancelRide = async (rideId) => {
    setLoadingBookingId(rideId);
    try {
      await postDriverResponse({ id: rideId, status: 'cancelled' });
      setNewPickups(prev => prev.filter(ride => ride.id !== rideId));
      setShowRideOptions(false);
      setSelectedRide(null);
    } catch (err) {
      // Optionally show error to user
    }
    setLoadingBookingId(null);
  };

  const handleRideClick = (ride) => {
    setSelectedRide(ride);
    setShowRideOptions(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      setWithdrawError('Enter a valid amount');
      return;
    }
    if (!withdrawDetails) {
      setWithdrawError('Enter your phone or bank details');
      return;
    }
    setWithdrawLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWithdrawLoading(false);
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setWithdrawDetails('');
      // Optionally update balance
      setDriverData(prev => ({ ...prev, balance: prev.balance - Number(withdrawAmount) }));
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess(false);
      }, 1800);
    }, 1500);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess(false);
    if (!settings.rate || isNaN(settings.rate) || Number(settings.rate) < 100) {
      setSettingsError('Enter a valid rate (min 100 MWK/km)');
      return;
    }
    if (!settings.vehicleType) {
      setSettingsError('Select a vehicle type');
      return;
    }
    try {
      const url = import.meta.env.VITE_CHANGERATE_URL;
      const email = sessionStorage.getItem('driverEmail');
      if (!url || !email) throw new Error('Missing config or email');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_rate: Number(settings.rate) })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || data.message || 'Failed to update rate');
      setSettingsSuccess(true);
      setDriverData(prev => ({ ...prev, rate: Number(settings.rate) }));
      setTimeout(() => setShowSettingsModal(false), 1200);
    } catch (err) {
      setSettingsError(err.message || 'Failed to update rate');
    }
  };

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          //console.log(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          // Optionally handle error (e.g., permission denied)
          setDriverLocation(null);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else {
      setDriverLocation(null);
    }
    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
      if (driverLocation && driverLocation.lat && driverLocation.lng) {
          const email = sessionStorage.getItem('driverEmail');
      if (email) {
        postDriverLocation({ lat: driverLocation.lat, lng: driverLocation.lng, email })
          .catch((err) => {
            // Optionally handle error (e.g., log or show notification)
            // console.error('Failed to post driver location:', err);
          });
      }
    }
  }, [driverLocation]);

  useEffect(() => {
    // Connect to WebSocket for real-time pickups
    const ws = connectRideSocket({
      onBooking: (data) => {
        // Use only the backend bookings array
        console.log(data.bookings)
        if (data && Array.isArray(data.bookings)) {
          setNewPickups(data.bookings);
        }
      }
    });
    return () => {
      if (ws && ws.readyState === 1) ws.close();
    };
  }, []);

  // Filter bookings by status
  const newPickupBookings = newPickups.filter(b => b.status === 'active');
  const inProgressBookings = newPickups.filter(b => b.status === 'inprogress');

  return (
    <div className={styles.driverDashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>R</div>
            <h1 className={styles.logoText}>RidesMw Driver</h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.settingsBtn} onClick={() => setShowSettingsModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94a1.43,1.43,0,0,0,0-1.88l2-1.55a.5.5,0,0,0,.12-.66l-2-3.46a.5.5,0,0,0-.61-.22l-2.35,1a5.37,5.37,0,0,0-1.6-.93l-.36-2.49A.5.5,0,0,0,13,3H11a.5.5,0,0,0-.5.42l-.36,2.49a5.37,5.37,0,0,0-1.6.93l-2.35-1a.5.5,0,0,0-.61.22l-2,3.46a.5.5,0,0,0,.12.66l2,1.55a1.43,1.43,0,0,0,0,1.88l-2,1.55a.5.5,0,0,0-.12.66l2,3.46a.5.5,0,0,0,.61.22l2.35-1a5.37,5.37,0,0,0,1.6.93l.36,2.49A.5.5,0,0,0,11,21h2a.5.5,0,0,0,.5-.42l.36-2.49a5.37,5.37,0,0,0,1.6-.93l2.35,1a.5.5,0,0,0,.61-.22l2-3.46a.5.5,0,0,0-.12-.66ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
              Settings
            </button>
            <button className={styles.withdrawBtn} onClick={() => setShowWithdrawModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-2c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1-7V8h2v4h3v2h-5z"/></svg>
              Withdraw
            </button>
            <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
              Logout
            </button>
            <button className={styles.changePasswordBtn} onClick={() => setShowChangePassword(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z"/>
              </svg>
              Change Password
            </button>
          </div>
        </div>
      </header>

      {/* Driver Info Card */}
      <div className={styles.driverInfoCard}>
        <div className={styles.driverProfile}>
          <div className={styles.avatar}>
            {driverData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className={styles.driverDetails}>
            <h2 className={styles.driverName}>{driverData.name}</h2>
            <p className={styles.vehicleInfo}>{driverData.vehicle} • {driverData.plate}</p>
            <div className={styles.rating}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingText}>{driverData.rating}</span>
            </div>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{formatCurrency(driverData.balance)}</span>
            <span className={styles.statLabel}>Balance</span>
            <button className={styles.withdrawBtnSmall} onClick={() => setShowWithdrawModal(true)}>
              Withdraw
            </button>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{driverData.totalRides}</span>
            <span className={styles.statLabel}>Total Rides</span>
          </div>
        </div>
      </div>

      {/* New Pickups Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>New Pickup Requests</h3>
          <span className={styles.pickupCount}>{newPickupBookings.length} available</span>
        </div>
        <div className={styles.pickupList}>
          {newPickupBookings.map((booking) => (
            <div key={booking.id} className={styles.pickupCard} onClick={() => handleRideClick(booking)}>
              <div className={styles.pickupHeader}>
                <div className={styles.customerInfo}>
                  <h4 className={styles.customerName}>{booking.phone_number}</h4>
                  <span className={styles.pickupTime}>{booking.created_at ? new Date(booking.created_at).toLocaleString() : ''}</span>
                </div>
                <div className={styles.fareInfo}>
                  <span className={styles.fare}>{formatCurrency(booking.price)}</span>
                  <span className={styles.distance}>{booking.current_location_name || `${booking.current_lat}, ${booking.current_lng}`}</span>
                </div>
              </div>
              <div className={styles.pickupDetails}>
                <div className={styles.locationInfo}>
                  <div className={styles.locationItem}>
                    <span className={styles.locationLabel}>From:</span>
                    <span className={styles.locationText}>{booking.current_location_name || `${booking.current_lat}, ${booking.current_lng}`}</span>
                  </div>
                  <div className={styles.locationItem}>
                    <span className={styles.locationLabel}>To:</span>
                    <span className={styles.locationText}>{booking.destination_name || `${booking.destination_lat}, ${booking.destination_lng}`}</span>
                  </div>
                </div>
              </div>
              <div className={styles.pickupActions}>
                <button
                  className={styles.cancelBtn}
                  disabled={loadingBookingId === booking.id}
                  onClick={e => {
                    e.stopPropagation();
                    handleCancelRide(booking.id);
                  }}
                >
                  {loadingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
                <button
                  className={styles.acceptBtn}
                  disabled={loadingBookingId === booking.id}
                  onClick={e => {
                    e.stopPropagation();
                    handleAcceptRide(booking.id);
                  }}
                >
                  {loadingBookingId === booking.id ? 'Accepting...' : 'Accept'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* In Progress Section */}
      {inProgressBookings.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Current Ride</h3>
          </div>
          <div className={styles.pickupList}>
            {inProgressBookings.map((booking) => (
              <div key={booking.id} className={styles.pickupCard}>
                <div className={styles.pickupHeader}>
                  <div className={styles.customerInfo}>
                    <h4 className={styles.customerName}>{booking.phone_number}</h4>
                    <span className={styles.pickupTime}>{booking.created_at ? new Date(booking.created_at).toLocaleString() : ''}</span>
                  </div>
                  <div className={styles.fareInfo}>
                    <span className={styles.fare}>{formatCurrency(booking.price)}</span>
                    <span className={styles.distance}>{booking.current_location_name || `${booking.current_lat}, ${booking.current_lng}`}</span>
                  </div>
                </div>
                <div className={styles.pickupDetails}>
                  <div className={styles.locationInfo}>
                    <div className={styles.locationItem}>
                      <span className={styles.locationLabel}>From:</span>
                      <span className={styles.locationText}>{booking.current_location_name || `${booking.current_lat}, ${booking.current_lng}`}</span>
                    </div>
                    <div className={styles.locationItem}>
                      <span className={styles.locationLabel}>To:</span>
                      <span className={styles.locationText}>{booking.destination_name || `${booking.destination_lat}, ${booking.destination_lng}`}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.pickupActions}>
                  <button className={styles.inProgressBtn} disabled>
                    In Progress
                  </button>
                  <button
                    className={styles.mapsBtn}
                    onClick={() => {
                      setMapModalOrigin(driverLocation ? { lat: driverLocation.lat, lng: driverLocation.lng } : null);
                      setMapModalDestination({ lat: booking.current_lat, lng: booking.current_lng });
                      setMapModalTitle('Route to Pickup');
                      setShowMapModal(true);
                    }}
                  >
                    View in Maps
                  </button>
                  <button
                    className={styles.destinationBtn}
                    onClick={() => {
                      setMapModalOrigin(driverLocation ? { lat: driverLocation.lat, lng: driverLocation.lng } : null);
                      setMapModalDestination({ lat: booking.destination_lat, lng: booking.destination_lng });
                      setMapModalTitle('Route to Destination');
                      setShowMapModal(true);
                    }}
                  >
                    View Destination in Maps
                  </button>
                  <a
                    className={styles.callBtn}
                    href={`tel:${booking.phone_number}`}
                    style={{ marginLeft: '0.7em' }}
                  >
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pickup History Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Rides</h3>
        </div>
        
        <div className={styles.historyList}>
          {pickupHistory.map((ride) => (
            <div key={ride.id} className={styles.historyCard}>
              <div className={styles.historyHeader}>
                <div className={styles.customerInfo}>
                  <h4 className={styles.customerName}>{ride.customerName}</h4>
                  <span className={styles.rideDate}>{ride.date}</span>
                </div>
                <div className={styles.fareInfo}>
                  <span className={styles.fare}>{formatCurrency(ride.fare)}</span>
                  <span className={styles.distance}>{ride.distance}</span>
                </div>
              </div>
              
              <div className={styles.historyDetails}>
                <div className={styles.locationInfo}>
                  <div className={styles.locationItem}>
                    <span className={styles.locationLabel}>From:</span>
                    <span className={styles.locationText}>{ride.pickupLocation}</span>
                  </div>
                  <div className={styles.locationItem}>
                    <span className={styles.locationLabel}>To:</span>
                    <span className={styles.locationText}>{ride.destination}</span>
                  </div>
                </div>
                <div className={styles.statusBadge}>
                  <span className={`${styles.status} ${styles[ride.status]}`}>
                    {ride.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ride Options Modal */}
      {showRideOptions && selectedRide && (
        <div className={styles.modalBackdrop} onClick={() => setShowRideOptions(false)}>
          <div className={styles.rideOptionsModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Ride Options</h3>
              <button className={styles.closeBtn} onClick={() => setShowRideOptions(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.rideDetails}>
              <h4 className={styles.rideCustomer}>{selectedRide.customerName}</h4>
              <div className={styles.rideInfo}>
                <p><strong>From:</strong> {selectedRide.pickupLocation}</p>
                <p><strong>To:</strong> {selectedRide.destination}</p>
                <p><strong>Distance:</strong> {selectedRide.distance}</p>
                <p><strong>Fare:</strong> {formatCurrency(selectedRide.fare)}</p>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.acceptRideBtn}
                onClick={() => {
                  handleAcceptRide(selectedRide.id);
                  setShowRideOptions(false);
                }}
              >
                Accept Ride
              </button>
              <button 
                className={styles.cancelRideBtn}
                onClick={() => handleCancelRide(selectedRide.id)}
              >
                Cancel Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className={styles.modalBackdrop} onClick={() => setShowChangePassword(false)}>
          <div className={styles.passwordModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Change Password</h3>
              <button className={styles.closeBtn} onClick={() => setShowChangePassword(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <form className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Current Password</label>
                <input type="password" className={styles.formInput} placeholder="Enter current password" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <input type="password" className={styles.formInput} placeholder="Enter new password" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <input type="password" className={styles.formInput} placeholder="Confirm new password" />
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" className={styles.savePasswordBtn}>
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.logoutModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Log Out</h3>
            </div>
            <div className={styles.logoutMessage}>Are you sure you want to log out?</div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowWithdrawModal(false)}>
          <div className={styles.withdrawModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Withdraw Funds</h3>
            </div>
            <form className={styles.withdrawForm} onSubmit={handleWithdraw}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount (MWK)</label>
                <input
                  type="number"
                  min="1"
                  className={styles.formInput}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone/Bank Details</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={withdrawDetails}
                  onChange={e => setWithdrawDetails(e.target.value)}
                  placeholder="e.g. Airtel Money, TNM Mpamba, or Bank Account"
                  required
                />
              </div>
              {withdrawError && <div className={styles.errorText}>{withdrawError}</div>}
              {withdrawSuccess && <div className={styles.successText}>Withdrawal request sent!</div>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowWithdrawModal(false)} disabled={withdrawLoading}>Cancel</button>
                <button type="submit" className={styles.withdrawBtn} disabled={withdrawLoading}>
                  {withdrawLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowSettingsModal(false)}>
          <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Driver Settings</h3>
            </div>
            <form className={styles.settingsForm} onSubmit={handleSettingsSave}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rate per km (MWK)</label>
                <input
                  type="number"
                  min="100"
                  className={styles.formInput}
                  value={settings.rate}
                  onChange={e => setSettings(s => ({ ...s, rate: e.target.value }))}
                  placeholder="Enter your rate per km"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Vehicle Type</label>
                <select
                  className={styles.formInput}
                  value={settings.vehicleType}
                  onChange={e => setSettings(s => ({ ...s, vehicleType: e.target.value }))}
                  required
                >
                  <option value="">Select vehicle type</option>
                  <option value="economy">Economy</option>
                  <option value="classic">Classic</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              {settingsError && <div className={styles.errorText}>{settingsError}</div>}
              {settingsSuccess && <div className={styles.successText}>Settings saved!</div>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowSettingsModal(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        origin={mapModalOrigin}
        destination={mapModalDestination}
        title={mapModalTitle}
      />
    </div>
  );
};

export default DriverComp;