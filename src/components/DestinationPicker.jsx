import React, { useState, useCallback, useRef } from 'react';
import styles from './DestinationPicker.module.css';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '240px',
  borderRadius: '16px',
  minHeight: '180px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
};
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

const DestinationPicker = ({ onDestinationSelect, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(currentLocation);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8',
    libraries: ['places']
  });
  const mapRef = useRef();

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    setSelectedLocation({ lat, lng, address: 'Selected Location' });
    onDestinationSelect({ lat, lng, address: 'Selected Location' });
  }, [onDestinationSelect]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    // Geocode the search query
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setLoading(false);
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        const coords = { lat: lat(), lng: lng() };
        setMapCenter(coords);
        setMarker(coords);
        setSelectedLocation({ ...coords, address: results[0].formatted_address });
        onDestinationSelect({ ...coords, address: results[0].formatted_address });
        if (mapRef.current) {
          mapRef.current.panTo(coords);
        }
      } else {
        alert('Location not found. Try a different search.');
      }
    });
  };

  return (
    <div className={styles.destinationPicker}>
      <div className={styles.searchBar}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for destination..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      <div className={styles.mapContainer}>
        {!isLoaded ? (
          <div className={styles.mapLoading}>
            <div className={styles.mapSpinner} />
            <p>Loading map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={15}
            options={mapOptions}
            onLoad={onMapLoad}
            onClick={onMapClick}
          >
            {/* Marker for selected location */}
            {marker && (
              <Marker
                position={marker}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(36, 36)
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>
      {selectedLocation && (
        <div className={styles.selectedLocation}>
          <h3>Selected Destination:</h3>
          <p>{selectedLocation.address}</p>
          <p className={styles.coordinates}>
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default DestinationPicker; 