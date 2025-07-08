export async function requestRide({ pickup, destination, driver, price, phone }) {
  const url = import.meta.env.VITE_RIDE_REQUEST_URL;
  const email = sessionStorage.getItem('userEmail');
  const body = {
    current_location: pickup || {},
    destination: destination || {},
    driver: driver || {},
    price: price ?? null,
    phone_number: phone ?? null,
    email: email ?? null
  };
  console.log(body);
  if (!url) throw new Error('Ride request URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errorMsg = 'Ride request failed';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function cancelRide({ id }) {
  const url = import.meta.env.VITE_CHANGESTATE_URL;
  const email = sessionStorage.getItem('userEmail');
  if (!url) throw new Error('Cancel ride URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, email }),
  });
  if (!res.ok) {
    let errorMsg = 'Cancel ride failed';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
} 