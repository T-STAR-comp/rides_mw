export async function postDriverLocation({ lat, lng, email }) {
  const url = import.meta.env.VITE_POSTDRIVER_LOCATION_URL;
  if (!url) throw new Error('Location post URL not configured');
  if (!email) throw new Error('Driver email required');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, email })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Failed to post location');
  }
  return res.json();
} 