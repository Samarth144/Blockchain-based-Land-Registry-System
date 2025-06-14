document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const walletAddress = document.getElementById('walletAddress').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',  // Ensure this is POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, password })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const token = await response.text();
    localStorage.setItem('jwtToken', token);
    alert('Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
});