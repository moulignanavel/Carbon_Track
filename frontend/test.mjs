import axios from 'axios';
(async () => {
  try {
    const login = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    const token = login.data.token;
    console.log('Logged in');
    
    await axios.post('http://localhost:8080/api/activity-logs/food', {
      mealType: 'beef',
      amount: 1,
      unit: 'servings',
      logDate: '2026-07-10'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success');
  } catch (err) {
    if (err.response) console.log('Error:', JSON.stringify(err.response.data));
    else console.log(err.message);
  }
})();
