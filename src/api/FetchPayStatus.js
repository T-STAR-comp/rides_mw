const PAY_STATUS_URL = import.meta.env.VITE_VERIFY_PAYMENT_URL;

const FetchPayStatus = async (bookingId) => {
  try {
    const res = await fetch(PAY_STATUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        trans_ID: sessionStorage.getItem('Trans_Id'),
        Id: bookingId
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: err.message || 'Failed to fetch payment status.' };
  }
}

export default FetchPayStatus; 