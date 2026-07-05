import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/sign-in/email', {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log('Login successful!', res.data);
  } catch (err: any) {
    console.error('Login failed!', err.response?.data || err.message);
  }
}

testLogin();
