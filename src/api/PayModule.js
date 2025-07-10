const PayModule = async (email, amount, callback, return_url) => {
  try {
    const response = await fetch(import.meta.env.VITE_MAKEPAYMENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        amount: amount,
        callback_url: callback,
        return_url: return_url,
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      sessionStorage.setItem('Trans_Id', data.data.data.tx_ref)
      return {
        checkout_url: data.data.checkout_url,
        status: "ok"
      };
    }

    if (response.status === 500) {
      return null;
    }

  } catch (err) {
    return { error: "Unexpected error occurred" };
  }
};

export default PayModule; 