export async function signupUser({ full_name, email, password }) {
  const url = import.meta.env.VITE_USER_SIGNUP_URL;
  if (!url) throw new Error('Signup URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name, email, password }),
  });
  if (!res.ok) {
    let errorMsg = 'Signup failed';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function loginUser({ email, password }) {
  const url = import.meta.env.VITE_USER_LOGIN_URL;
  if (!url) throw new Error('Login URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let errorMsg = 'Login failed';
    try {
      const data = await res.json();
      errorMsg = data.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
} 