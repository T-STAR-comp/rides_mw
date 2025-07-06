import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './styles/home.module.css';
import DestinationPicker from '../components/DestinationPicker';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8',
    libraries: ['places']
  });
  const mapRef = useRef();

  useEffect(() => {
    setIsVisible(true);
    requestLocationPermission();
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

  const handleFindRides = () => {
    setShowModal(true);
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
  };

  const fetchAvailableRides = async () => {
    setRidesLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock available rides data
    const mockRides = [
      {
        id: 1,
        driver: {
          name: 'John Banda',
          rating: 4.8,
          vehicle: 'Toyota Corolla',
          plate: 'MW 1234'
        },
        price: 2500,
        currency: 'MWK',
        estimatedTime: '5 min',
        distance: '2.1 km',
        vehicleType: 'Economy'
      },
      {
        id: 2,
        driver: {
          name: 'Sarah Mhango',
          rating: 4.9,
          vehicle: 'Honda Civic',
          plate: 'MW 5678'
        },
        price: 3200,
        currency: 'MWK',
        estimatedTime: '3 min',
        distance: '1.8 km',
        vehicleType: 'Comfort'
      },
      {
        id: 3,
        driver: {
          name: 'Mike Phiri',
          rating: 4.7,
          vehicle: 'Toyota Camry',
          plate: 'MW 9012'
        },
        price: 4500,
        currency: 'MWK',
        estimatedTime: '7 min',
        distance: '3.2 km',
        vehicleType: 'Premium'
      },
      {
        id: 4,
        driver: {
          name: 'Grace Nkhoma',
          rating: 4.6,
          vehicle: 'Suzuki Swift',
          plate: 'MW 3456'
        },
        price: 2000,
        currency: 'MWK',
        estimatedTime: '8 min',
        distance: '2.8 km',
        vehicleType: 'Economy'
      }
    ];
    
    setAvailableRides(mockRides);
    setRidesLoading(false);
  };

  const handleRideSelect = (ride) => {
    setSelectedRide(ride);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRide) {
      alert('Please select a ride first!');
      return;
    }
    
    console.log('Booking ride:', { ...formData, selectedRide });
    // Here you would typically send the data to your backend
    alert(`Ride booked with ${selectedRide.driver.name}! We'll contact you soon.`);
    setShowModal(false);
    setFormData({ name: '', destination: '', phone: '', notes: '' });
    setSelectedRide(null);
    setAvailableRides([]);
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="#" className={styles.logo}>
            <div className={styles.logoIcon}>R</div>
            RidesMw
          </a>
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
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  placeholder="Enter your full name"
                />
              </div>
              
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
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!selectedRide}
              >
                {selectedRide ? `Book with ${selectedRide.driver.name}` : 'Select a ride first'}
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
    </div>
  );
};

export default Home;