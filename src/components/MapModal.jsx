import React from 'react';

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.55)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle = {
  background: '#fff',
  borderRadius: 18,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  maxWidth: 600,
  width: '98vw',
  maxHeight: '90vh',
  padding: '1.5rem 1rem 1rem 1rem',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const headerBtnRow = {
  position: 'absolute',
  top: 12,
  right: 16,
  display: 'flex',
  gap: 8,
  zIndex: 1,
};

const closeBtnStyle = {
  background: '#FF6B35',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '6px 16px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const mapsBtnStyle = {
  background: '#4285f4',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '6px 16px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(66,133,244,0.10)',
  marginLeft: 8,
  textDecoration: 'none',
  display: 'inline-block',
};

const titleStyle = {
  fontSize: '1.2rem',
  fontWeight: 700,
  marginBottom: 12,
  color: '#222',
  textAlign: 'center',
};

const mapStyle = {
  width: '520px',
  height: '520px',
  maxWidth: '98vw',
  maxHeight: '80vh',
  border: 0,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
};

// Responsive fallback for very small screens
const responsiveMapStyle = {
  ...mapStyle,
  width: '100%',
  height: '60vw',
  minHeight: 240,
  minWidth: 200,
};

const MapModal = ({ open, onClose, origin, destination, marker, title }) => {
  if (!open) return null;

  let src = '';
  let mapsUrl = '';
  if (origin && destination) {
    // Directions
    src = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving`;
    mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  } else if (marker) {
    src = `https://www.google.com/maps?q=${marker.lat},${marker.lng}&z=16&output=embed`;
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`;
  } else if (origin) {
    src = `https://www.google.com/maps?q=${origin.lat},${origin.lng}&z=16&output=embed`;
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${origin.lat},${origin.lng}`;
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerBtnRow}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={mapsBtnStyle}
          >
            Open in Google Maps
          </a>
          <button style={closeBtnStyle} onClick={onClose}>Close</button>
        </div>
        {title && <div style={titleStyle}>{title}</div>}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <iframe
            title="Map"
            width="520"
            height="520"
            style={mapStyle}
            frameBorder="0"
            src={src}
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default MapModal; 