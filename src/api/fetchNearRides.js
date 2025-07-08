export async function fetchNearRides({ lat, lng }) {
  const url = import.meta.env.VITE_GETRIDES_DATA_URL;
  if (!url) throw new Error('Get rides URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Failed to fetch nearby rides');
  }
  return res.json();
} 