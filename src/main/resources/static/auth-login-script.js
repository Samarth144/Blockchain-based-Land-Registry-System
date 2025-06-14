document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const walletAddress = document.getElementById('walletAddress').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for CORS with cookies
      body: JSON.stringify({ walletAddress, password })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const token = await response.text();
    localStorage.setItem('jwtToken', token);
    window.location.href = '/dashboard.html';

  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed: ' + error.message);
  }
});