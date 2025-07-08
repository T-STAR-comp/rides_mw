export function connectRideSocket({ onBooking } = {}) {
  const email = sessionStorage.getItem('userEmail');
  const driver_plate = sessionStorage.getItem('driverPlate');
  if (!email && !driver_plate) {
    console.warn('No userEmail or driverPlate in sessionStorage');
    return;
  }
  const ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    const payload = {};
    if (email) payload.email = email;
    if (driver_plate) payload.driver_plate = driver_plate;
    ws.send(JSON.stringify(payload));
    console.log('WebSocket connected and payload sent:', payload);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);
      if (onBooking && data.bookings) {
        onBooking(data);
      }
    } catch (e) {
      console.log('WebSocket message (raw):', event.data);
    }
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
} 