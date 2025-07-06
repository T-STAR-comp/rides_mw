import React, { useState, useEffect } from 'react';
import styles from './DestinationPicker.module.css';

const DestinationPicker = ({ onDestinationSelect, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const handleMapClick = (event) => {
    // In a real implementation, you would convert screen coordinates to map coordinates
    // For now, we'll simulate a location selection
    const mockLocation = {
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.01,
      address: 'Selected Location'
    };
    
    setSelectedLocation(mockLocation);
    onDestinationSelect(mockLocation);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real implementation, you would geocode the search query
      const mockLocation = {
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.01,
        address: searchQuery
      };
      
      setSelectedLocation(mockLocation);
      onDestinationSelect(mockLocation);
    }
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
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>

      <div className={styles.mapContainer}>
        {!mapLoaded ? (
          <div className={styles.mapLoading}>
            <div className={styles.mapSpinner} />
            <p>Loading map...</p>
          </div>
        ) : (
          <div className={styles.mapWrapper} onClick={handleMapClick}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${currentLocation.lat},${currentLocation.lng}&zoom=15&maptype=roadmap`}
              className={styles.mapIframe}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            
            {/* Click indicator */}
            <div className={styles.clickIndicator}>
              <div className={styles.clickIcon}>📍</div>
              <p>Click on the map to select destination</p>
            </div>

            {/* Selected location marker */}
            {selectedLocation && (
              <div className={styles.selectedMarker}>
                <div className={styles.markerDot} />
                <div className={styles.markerLabel}>
                  {selectedLocation.address}
                </div>
              </div>
            )}
          </div>
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