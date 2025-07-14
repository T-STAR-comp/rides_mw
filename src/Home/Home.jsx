import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './styles/home.module.css';
import DestinationPicker from '../components/DestinationPicker';
import Footer from '../components/footer';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { requestRide, cancelRide } from '../api/rideApi';
import { connectRideSocket } from './rideSocket';
import { getDistanceKm, getRidePrice } from '../utils/distance';
import { fetchNearRides } from '../api/fetchNearRides';
import PayModule from '../api/PayModule';
import FetchPayStatus from '../api/FetchPayStatus';
import MapModal from '../components/MapModal';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '24px',
  minHeight: '320px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)'
};
const defaultCenter = { lat: -13.9626, lng: 33.7741 };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#333' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#fff' }] },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e3e6ea' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#fff' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#f7f8fa' }]
    }
  ]
};

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    phone: '',
    notes: ''
  });
  const [availableRides, setAvailableRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackRideStatus, setTrackRideStatus] = useState('on the way');
  const [trackRideLoading, setTrackRideLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [distanceKm, setDistanceKm] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentErrorType, setPaymentErrorType] = useState(''); // 'init' or 'status'
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const paymentSuccessTimeoutRef = useRef(null);
  const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState(''); // 'success' | 'failure'
  const [paymentResultMessage, setPaymentResultMessage] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalOrigin, setMapModalOrigin] = useState(null);
  const [mapModalDestination, setMapModalDestination] = useState(null);
  const [mapModalTitle, setMapModalTitle] = useState('');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8',
    libraries: ['places']
  });
  const mapRef = useRef();

  useEffect(() => {
    setIsVisible(true);
    requestLocationPermission();
    const ws = connectRideSocket({
      onBooking: (bookingData) => {
        if (bookingData && Array.isArray(bookingData.bookings) && bookingData.bookings.length > 0) {
          setCurrentBooking(bookingData.bookings[0]);
        }
      }
    });
    return () => {
      if (ws && ws.readyState === 1) ws.close();
    };
  }, []);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setMapLoaded(true);
        },
        (error) => {
          setLocationPermission('denied');
          setUserLocation(defaultCenter);
          setMapCenter(defaultCenter);
          setMapLoaded(true);
        },
        options
      );
    } else {
      setLocationPermission('not-supported');
      setUserLocation(defaultCenter);
      setMapCenter(defaultCenter);
      setMapLoaded(true);
    }
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event) => {
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  const handleFindRides = async () => {
    setShowModal(true);
    if (userLocation && userLocation.lat && userLocation.lng) {
      try {
        const data = await fetchNearRides({ lat: userLocation.lat, lng: userLocation.lng });
        console.log('Nearby rides from server:', data);
      } catch (err) {
        console.error('Failed to fetch nearby rides:', err);
      }
    }
    fetchAvailableRides();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRide(null);
    setAvailableRides([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDestinationSelect = (destination) => {
    setFormData(prev => ({
      ...prev,
      destination: destination.address
    }));
    if (destination.lat && destination.lng) {
      setMarker({ lat: destination.lat, lng: destination.lng });
    }
  };

  const fetchAvailableRides = async () => {
    setRidesLoading(true);
    if (userLocation && userLocation.lat && userLocation.lng) {
      try {
        const data = await fetchNearRides({ lat: userLocation.lat, lng: userLocation.lng });
        // data.drivers is an array of driver objects
        const rides = (data.drivers || []).map((driver, idx) => {
          const distance = driver.distance_km !== undefined && driver.distance_km !== null ? parseFloat(driver.distance_km) : null;
          const rate = driver.rate_per_km ? parseFloat(driver.rate_per_km) : null;
          const price = (distance && rate) ? Math.round(distance * rate) : rate || 0;
          return {
            id: driver.id || idx,
            driver: {
              name: driver.full_name,
              rating: parseFloat(driver.driver_rating),
              vehicle: driver.car_type,
              plate: driver.car_plate,
              rate: rate,
              email: driver.email,
              vehicleType: driver.vehicle_type
            },
            price: price,
            currency: 'MWK',
            estimatedTime: driver.estimated_minutes !== undefined && driver.estimated_minutes !== null ? `${driver.estimated_minutes} min` : '—',
            distance: distance !== null ? `${distance.toFixed(2)} km` : '—',
            vehicleType: driver.vehicle_type
          };
        });
        setAvailableRides(rides);
      } catch (err) {
        setAvailableRides([]);
        // Optionally handle error
      }
    } else {
      setAvailableRides([]);
    }
    setRidesLoading(false);
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRide) {
      alert('Please select a ride first!');
      return;
    }
    setBookingLoading(true);
    // Prepare data for ride request
    const pickup = userLocation;
    const destination = marker;
    const driver = selectedRide.driver;
    const price = calculatedPrice ?? selectedRide.price;
    const phone = formData.phone;
    try {
      const response = await requestRide({ pickup, destination, driver, price, phone });
      setShowModal(false);
      setFormData({ name: '', destination: '', phone: '', notes: '' });
      setSelectedRide(null);
      setAvailableRides([]);
      setSuccessData({
        driver,
        destination,
        price,
        eta: selectedRide.estimatedTime,
        message: response.message || 'Ride booked successfully!'
      });
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessData(null);
      }, 2500);
    } catch (err) {
      alert('Failed to book ride: ' + err.message);
    }
    setBookingLoading(false);
  };

  const getDriverInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.star}>☆</span>);
    }
    
    return stars;
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  // Track Ride actions
  const handleCancelRide = async () => {
    if (!currentBooking) return;
    setTrackRideLoading(true);
    setCancelLoading(true);
    setCancelError('');
    try {
      await cancelRide({ id: currentBooking.id });
      setTrackRideStatus('cancelled');
      setTimeout(() => {
        window.location.reload();
      }, 600); // Give a short delay for feedback
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel ride');
    } finally {
      setTrackRideLoading(false);
      setCancelLoading(false);
    }
  };
  const handlePayNow = async () => {
    setTrackRideLoading(true);
    setPayLoading(true);
    setPaymentError('');
    setPaymentErrorType('');
    try {
      const email = sessionStorage.getItem('userEmail');
      const amount = currentRide.fare;
      const callback = window.location.origin;
      const return_url = window.location.origin + "/paymentstatus";
      const result = await PayModule(email, amount, callback, return_url);
      if (result && result.status === 'ok' && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        setTrackRideStatus('paid');
        setPaymentResult('success');
        setPaymentResultMessage('Payment successful!');
        setShowPaymentResultModal(true);
      }
    } catch (err) {
      setPaymentError('Network error. Please check your connection and try again.');
      setPaymentErrorType('init');
      setPaymentResult('failure');
      setPaymentResultMessage('Network error. Please check your connection and try again.');
      setShowPaymentResultModal(true);
    }
    setTrackRideLoading(false);
    setPayLoading(false);
  };

  // Example current ride data (replace with real data as needed)
  const booking = currentBooking;
  const currentRide = booking
    ? {
        driver: {
          name: booking.driver_name,
          vehicle: booking.driver_vehicle,
          plate: booking.driver_plate,
          rating: booking.driver_rating,
        },
        eta: '',
        status: booking.status,
        pickup: booking.current_location_name || `${booking.current_lat}, ${booking.current_lng}`,
        destination: booking.destination_name || `${booking.destination_lat}, ${booking.destination_lng}`,
        fare: booking.price,
        currency: 'MWK',
        mapCenter: { lat: parseFloat(booking.current_lat), lng: parseFloat(booking.current_lng) },
        marker: { lat: parseFloat(booking.destination_lat), lng: parseFloat(booking.destination_lng) },
      }
    : {
        driver: {
          name: 'Sarah Mhango',
          vehicle: 'Honda Civic',
          plate: 'MW 5678',
          phone: '+265 999 123 456',
        },
        eta: '3 min',
        status: 'on the way',
        pickup: 'Lilongwe City Centre',
        destination: 'Area 47, Lilongwe',
        fare: 3200,
        currency: 'MWK',
        mapCenter: { lat: -13.9626, lng: 33.7741 },
        marker: { lat: -13.9626, lng: 33.7741 },
      };

  // Recalculate distance and price when marker or selectedRide changes
  useEffect(() => {
    if (userLocation && marker && selectedRide && selectedRide.driver && selectedRide.driver.rate) {
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, marker.lat, marker.lng);
      setDistanceKm(dist);
      setCalculatedPrice(getRidePrice(dist, selectedRide.driver.rate));
    } else {
      setDistanceKm(null);
      setCalculatedPrice(null);
    }
  }, [userLocation, marker, selectedRide]);

  useEffect(() => {
    const checkPayment = async () => {
      const transId = sessionStorage.getItem('Trans_Id');
      if (transId && currentBooking && currentBooking.id) {
        setPaymentVerifying(true);
        setPaymentError('');
        setPaymentErrorType('');
        try {
          const result = await FetchPayStatus(currentBooking.id);
          if (result && result.status === 'ok') {
            setTrackRideStatus('paid');
            setPaymentSuccess(true);
            sessionStorage.removeItem('Trans_Id');
            if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
            paymentSuccessTimeoutRef.current = setTimeout(() => setPaymentSuccess(false), 10000);
            setPaymentResult('success');
            setPaymentResultMessage('Payment successful!');
            setShowPaymentResultModal(true);
          } else if (result && result.error) {
            setPaymentError(result.error);
            setPaymentErrorType('status');
            setPaymentResult('failure');
            setPaymentResultMessage(result.error);
            setShowPaymentResultModal(true);
          } else {
            setPaymentError('Payment not completed yet.');
            setPaymentErrorType('status');
          }
        } catch (err) {
          setPaymentError('Network error. Please check your connection and try again.');
          setPaymentErrorType('status');
          setPaymentResult('failure');
          setPaymentResultMessage('Network error. Please check your connection and try again.');
          setShowPaymentResultModal(true);
        }
        setPaymentVerifying(false);
      }
    };
    checkPayment();
    // Optionally, poll every X seconds:
    // const interval = setInterval(checkPayment, 5000);
    // return () => clearInterval(interval);
    return () => {
      if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
    };
  }, [currentBooking]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="#" className={styles.logo}>
            <div className={styles.logoIcon}>R</div>
            RidesMw
          </a>
          {/* Hide these buttons on mobile, show only on desktop */}
          <div className={styles.desktopActions}>
            <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
              Log Out
            </button>
            <button className={styles.trackBtn} onClick={() => setShowTrackModal(true)}>
              Track Ride
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Map */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your Ride, Your Way
          </h1>
          <p className={styles.heroSubtitle}>
            Experience seamless transportation across Malawi with RidesMw. 
            Connect with trusted drivers, enjoy safe rides, and explore 
            the beautiful landscapes of Malawi with just a tap.
          </p>
          
          {locationPermission === 'pending' && (
            <div className={`${styles.locationNotification}`}>
              <div className={`${styles.notificationIcon} ${styles.primary}`}>
                📍
              </div>
              <span className={styles.notificationText}>
                Requesting location permission...
              </span>
            </div>
          )}

          {locationPermission === 'denied' && (
            <div className={`${styles.locationNotification} ${styles.warning}`}>
              <div className={`${styles.notificationIcon} ${styles.warning}`}>
                ⚠️
              </div>
              <span className={styles.notificationText}>
                Location access denied. Showing default location.
              </span>
            </div>
          )}

          <button 
            className={styles.ctaButton}
            onClick={handleFindRides}
          >
            Look for Rides
            <span>→</span>
          </button>
        </div>

        <div className={styles.heroVisual}>
          {/* Google Maps Container */}
          <div className={styles.mapContainer}>
            {!isLoaded ? (
              <div className={styles.mapLoading}>
                <div className={styles.mapSpinner} />
                <p className={styles.mapLoadingText}>Loading map...</p>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={17}
                options={mapOptions}
                onLoad={onMapLoad}
                onClick={onMapClick}
              >
                {/* User Location Marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#FF6B35',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#fff'
                    }}
                  />
                )}
                {/* Clicked Marker */}
                {marker && (
                  <Marker
                    position={marker}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                )}
              </GoogleMap>
            )}
            {/* Map Overlay with Location Status */}
            {mapLoaded && (
              <div className={styles.mapOverlay}>
                <div className={styles.overlayLogo}>
                  <div className={styles.overlayLogoIcon}>
                    R
                  </div>
                  <span className={styles.overlayLogoText}>
                    RidesMw
                  </span>
                </div>
                <div className={styles.locationStatus}>
                  <div className={`${styles.statusDot} ${locationPermission === 'granted' ? styles.granted : styles.denied}`} />
                  <span className={styles.statusText}>
                    {locationPermission === 'granted' 
                      ? `Location: ${userLocation?.lat?.toFixed(6)}, ${userLocation?.lng?.toFixed(6)}`
                      : 'Location access needed'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresContent}>
          <h2 className={styles.sectionTitle}>Why Choose RidesMw?</h2>
          <p className={styles.sectionSubtitle}>
            We're revolutionizing transportation in Malawi with cutting-edge technology 
            and a commitment to safety, reliability, and community.
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Safe & Reliable</h3>
              <p className={styles.featureDescription}>
                All our drivers are verified and vehicles are regularly inspected. 
                Your safety is our top priority with 24/7 support and real-time tracking.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Lightning Fast</h3>
              <p className={styles.featureDescription}>
                Get matched with nearby drivers in seconds. Our intelligent 
                algorithm ensures the fastest pickup times across Malawi.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Affordable Rates</h3>
              <p className={styles.featureDescription}>
                Transparent pricing with no hidden fees. Pay with cash or 
                mobile money. Get the best value for your transportation needs.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Nationwide Coverage</h3>
              <p className={styles.featureDescription}>
                From Lilongwe to Blantyre, Mzuzu to Zomba - we're connecting 
                communities across Malawi with reliable transportation.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Smart App</h3>
              <p className={styles.featureDescription}>
                Intuitive interface designed for Malawi. Works seamlessly 
                on all devices with offline capabilities and local language support.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>Community First</h3>
              <p className={styles.featureDescription}>
                Supporting local drivers and communities. We're building 
                a transportation network that benefits all Malawians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContent}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50K+</div>
            <div className={styles.statLabel}>Happy Riders</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>1K+</div>
            <div className={styles.statLabel}>Verified Drivers</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>25+</div>
            <div className={styles.statLabel}>Cities Covered</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4.9★</div>
            <div className={styles.statLabel}>User Rating</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '4rem 2rem',
        background: 'var(--white)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Ready to Ride?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join thousands of Malawians who trust RidesMw for their daily transportation needs.
          </p>
          <button className={styles.ctaButton}>
            Download RidesMw
            <span>→</span>
          </button>
        </div>
      </section>

      {/* iOS Style Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className={styles.modalBackdrop}
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className={styles.modal}>
            {/* Handle */}
            <div className={styles.modalHandle} />
            
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Book Your Ride
              </h2>
              <p className={styles.modalSubtitle}>
                Tell us where you want to go
              </p>
            </div>
            
            {/* Available Rides Section */}
            <div className={styles.ridesSection}>
              <div className={styles.ridesHeader}>
                <h3 className={styles.ridesTitle}>Available Rides</h3>
                <span className={styles.ridesCount}>
                  {ridesLoading ? '...' : `${availableRides.length} nearby`}
                </span>
              </div>
              
              {ridesLoading ? (
                <div className={styles.ridesLoading}>
                  <div className={styles.loadingSpinner} />
                  <p className={styles.loadingText}>Finding nearby drivers...</p>
                </div>
              ) : availableRides.length > 0 ? (
                <div className={styles.ridesList}>
                  {availableRides.map((ride) => (
                    <div
                      key={ride.id}
                      className={`${styles.rideCard} ${selectedRide?.id === ride.id ? styles.selected : ''}`}
                      onClick={() => handleRideSelect(ride)}
                    >
                      <div className={styles.rideHeader}>
                        <div className={styles.rideDriver}>
                          <div className={styles.driverAvatar}>
                            {getDriverInitials(ride.driver.name)}
                          </div>
                          <div className={styles.driverInfo}>
                            <h4>{ride.driver.name}</h4>
                            <p>{ride.driver.vehicle} • {ride.driver.plate}</p>
                          </div>
                        </div>
                        <div className={styles.ridePrice}>
                          <p className={styles.price}>{ride.price.toLocaleString()}</p>
                          <p className={styles.currency}>{ride.currency}</p>
                        </div>
                      </div>
                      
                      <div className={styles.rideDetails}>
                        <div className={styles.rideInfo}>
                          <span>
                            <span className={styles.star}>★</span>
                            {ride.driver.rating}
                          </span>
                          <span>•</span>
                          <span>{ride.vehicleType}</span>
                          <span>•</span>
                          <span>{ride.distance}</span>
                        </div>
                        <div className={styles.rideTime}>
                          {ride.estimatedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noRides}>
                  <div className={styles.noRidesIcon}>🚗</div>
                  <p className={styles.noRidesText}>No rides available</p>
                  <p className={styles.noRidesSubtext}>Try again in a few minutes</p>
                </div>
              )}
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Destination
                </label>
                {userLocation && (
                  <DestinationPicker 
                    onDestinationSelect={handleDestinationSelect}
                    currentLocation={userLocation}
                  />
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className={styles.formTextarea}
                  placeholder="Any special requests or notes for the driver?"
                />
              </div>
              
              {distanceKm && calculatedPrice && (
                <div className={styles.priceInfo}>
                  Distance: {distanceKm.toFixed(2)} km | Price: {calculatedPrice.toLocaleString()} MWK
                </div>
              )}
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!selectedRide || !marker || bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <div className={styles.spinner} />
                    Booking...
                  </>
                ) : (
                  selectedRide ? `Book with ${selectedRide.driver.name}` : 'Select a ride first'
                )}
              </button>
            </form>
            
            {/* Cancel Button */}
            <button
              onClick={handleCloseModal}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowLogoutModal(false)} />
          <div className={styles.logoutModal}>
            <div className={styles.modalHandle} />
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Log Out</h2>
            </div>
            <div className={styles.logoutMessage}>
              Are you sure you want to log out?
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Track Ride Modal */}
      {showTrackModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowTrackModal(false)} />
          <div className={styles.trackModal}>
            <div className={styles.modalHandle} />
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Track Your Ride</h2>
            </div>
            {currentBooking ? (
              <div className={styles.trackRideInfo}>
                <div className={styles.trackDriverRow}>
                  <div className={styles.trackDriverAvatar}>{currentRide.driver.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className={styles.trackDriverDetails}>
                    <div className={styles.trackDriverName}>{currentRide.driver.name}</div>
                    <div className={styles.trackDriverCar}>{currentRide.driver.vehicle} • {currentRide.driver.plate}</div>
                    <div className={styles.trackDriverEta}>ETA: {currentRide.eta}</div>
                  </div>
                </div>
                <div className={styles.trackRideStatusRow}>
                  <span className={styles.trackRideStatus + ' ' + styles[currentRide.status.replace(/\s/g, '')]}>{currentRide.status}</span>
                </div>
                {currentRide.status === 'inprogress' && (
                  <div className={styles.onTheWayMsg}>
                    <span className={styles.onTheWayIcon}>🚗</span>
                    <span className={styles.onTheWayText}>Your driver is on the way</span>
                    <button
                      className={styles.mapsBtn}
                      onClick={() => {
                        setMapModalOrigin({ lat: currentRide.mapCenter.lat, lng: currentRide.mapCenter.lng });
                        setMapModalDestination(null);
                        setMapModalTitle('Your Location');
                        setShowMapModal(true);
                      }}
                    >
                      View in Maps
                    </button>
                  </div>
                )}
                <div className={styles.trackRideLocations}>
                  <div><strong>From:</strong> {currentRide.pickup}</div>
                  <div><strong>To:</strong> {currentRide.destination}</div>
                </div>
              </div>
            ) : (
              <div className={styles.noBookingMsg}>No booked rides available</div>
            )}
            {currentBooking && (
              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={handleCancelRide} disabled={trackRideLoading || cancelLoading || currentRide.status === 'cancelled' || currentRide.status === 'paid'}>
                  {cancelLoading ? 'Cancelling...' : 'Cancel Ride'}
                </button>
                {currentRide.status === 'inprogress' && !paymentSuccess && (
                  <button className={styles.payButton} onClick={handlePayNow} disabled={trackRideLoading || payLoading || paymentVerifying || currentRide.status === 'paid' || currentRide.status === 'cancelled'}>
                    {payLoading ? 'Processing...' : paymentVerifying ? 'Verifying...' : currentRide.status === 'paid' ? 'Paid' : 'Pay Now'}
                  </button>
                )}
                {paymentVerifying && (
                  <div className={styles.paymentStatusMsg}><span className={styles.spinner} /> Verifying payment...</div>
                )}
                {paymentSuccess && (
                  <div className={styles.paymentSuccessMsg}>
                    Payment successful! 🎉
                    <button
                      className={styles.backButton}
                      style={{ marginLeft: 16, marginTop: 12, padding: '8px 20px', borderRadius: 8, background: '#FF6B35', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      onClick={() => {
                        if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
                        setPaymentSuccess(false);
                      }}
                    >
                      Back
                    </button>
                  </div>
                )}
                {paymentError && (
                  <div className={styles.paymentErrorMsg}>
                    {paymentError}
                    <button
                      className={styles.retryButton}
                      style={{ marginLeft: 12, marginTop: 10, padding: '7px 18px', borderRadius: 8, background: '#FF6B35', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      onClick={async () => {
                        setPaymentError('');
                        setPaymentErrorType('');
                        if (paymentErrorType === 'init') {
                          await handlePayNow();
                        } else if (paymentErrorType === 'status') {
                          setPaymentVerifying(true);
                          try {
                            const result = await FetchPayStatus(currentBooking.id);
                            if (result && result.status === 'ok') {
                              setTrackRideStatus('paid');
                              setPaymentSuccess(true);
                              sessionStorage.removeItem('Trans_Id');
                              if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
                              paymentSuccessTimeoutRef.current = setTimeout(() => setPaymentSuccess(false), 10000);
                            } else if (result && result.error) {
                              setPaymentError(result.error);
                              setPaymentErrorType('status');
                            } else {
                              setPaymentError('Payment not completed yet.');
                              setPaymentErrorType('status');
                            }
                          } catch (err) {
                            setPaymentError('Network error. Please check your connection and try again.');
                            setPaymentErrorType('status');
                          }
                          setPaymentVerifying(false);
                        }
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}
            {cancelError && <div className={styles.errorText}>{cancelError}</div>}
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className={styles.successModalBackdrop}>
          <div className={styles.successModal}>
            <div className={styles.successCheckmark}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="28" r="28" fill="#2ecc71"/>
                <path d="M16 29.5L25 38L40 21" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.successTitle}>Ride Booked!</h2>
            <div className={styles.successMessage}>{successData.message}</div>
            <div className={styles.successSummary}>
              <div><strong>Driver:</strong> {successData.driver.name} ({successData.driver.vehicle}, {successData.driver.plate})</div>
              <div><strong>Destination:</strong> {successData.destination.lat.toFixed(5)}, {successData.destination.lng.toFixed(5)}</div>
              <div><strong>Price:</strong> {successData.price.toLocaleString()} MWK</div>
              <div><strong>ETA:</strong> {successData.eta}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Result Modal */}
      {showPaymentResultModal && (
        <div className={styles.paymentResultModalBackdrop}>
          <div className={styles.paymentResultModal}>
            <div className={styles.paymentResultIcon}>
              {paymentResult === 'success' ? (
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="28" r="28" fill="#2ecc71"/>
                  <path d="M16 29.5L25 38L40 21" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="28" r="28" fill="#e74c3c"/>
                  <path d="M20 20L36 36M36 20L20 36" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <h2 className={styles.paymentResultTitle}>{paymentResult === 'success' ? 'Payment Successful' : 'Payment Failed'}</h2>
            <div className={styles.paymentResultMessage}>{paymentResultMessage}</div>
            <div className={styles.paymentResultActions}>
              {paymentResult === 'failure' && (
                <button
                  className={styles.retryButton}
                  onClick={async () => {
                    setShowPaymentResultModal(false);
                    setPaymentError('');
                    setPaymentErrorType('');
                    setPaymentResult('');
                    setPaymentResultMessage('');
                    if (paymentErrorType === 'init') {
                      await handlePayNow();
                    } else if (paymentErrorType === 'status') {
                      setPaymentVerifying(true);
                      try {
                        const result = await FetchPayStatus(currentBooking.id);
                        if (result && result.status === 'ok') {
                          setTrackRideStatus('paid');
                          setPaymentSuccess(true);
                          sessionStorage.removeItem('Trans_Id');
                          if (paymentSuccessTimeoutRef.current) clearTimeout(paymentSuccessTimeoutRef.current);
                          paymentSuccessTimeoutRef.current = setTimeout(() => setPaymentSuccess(false), 10000);
                          setPaymentResult('success');
                          setPaymentResultMessage('Payment successful!');
                          setShowPaymentResultModal(true);
                        } else if (result && result.error) {
                          setPaymentError(result.error);
                          setPaymentErrorType('status');
                          setPaymentResult('failure');
                          setPaymentResultMessage(result.error);
                          setShowPaymentResultModal(true);
                        } else {
                          setPaymentError('Payment not completed yet.');
                          setPaymentErrorType('status');
                        }
                      } catch (err) {
                        setPaymentError('Network error. Please check your connection and try again.');
                        setPaymentErrorType('status');
                        setPaymentResult('failure');
                        setPaymentResultMessage('Network error. Please check your connection and try again.');
                        setShowPaymentResultModal(true);
                      }
                      setPaymentVerifying(false);
                    }
                  }}
                >
                  Retry
                </button>
              )}
              <button
                className={styles.backButton}
                onClick={() => {
                  setShowPaymentResultModal(false);
                  setPaymentResult('');
                  setPaymentResultMessage('');
                }}
              >
                {paymentResult === 'success' ? 'Back' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Map Modal */}
      <MapModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        origin={mapModalOrigin}
        destination={mapModalDestination}
        title={mapModalTitle}
      />
      {/* Bottom Navigation Bar for Mobile */}
      <nav className={styles.bottomNav}>
        <button className={styles.bottomNavBtn} onClick={() => setShowTrackModal(true)}>
          {/* Compass/Track SVG Icon */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polygon points="12,7 15,17 12,15 9,17" fill="currentColor"/></svg>
          <span>Track Ride</span>
        </button>
        <button className={styles.bottomNavBtn} onClick={() => setShowLogoutModal(true)}>
          {/* Logout SVG Icon */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 12h5m0 0l-2-2m2 2l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Home;