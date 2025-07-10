export async function postDriverResponse({ id, status }) {
  const url = import.meta.env.VITE_DRIVER_RESP_URL;
  if (!url) throw new Error('Driver response URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Failed to send driver response');
  }
  return res.json();
} 