// Example using fetch API in frontend
const getUserDetails = async () => {
    const token = localStorage.getItem('jwtToken');
    console.log(token); // Assuming JWT is stored in localStorage
  
    const response = await fetch('http://localhost:3000/details', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // Pass JWT token in Authorization header
        'Content-Type': 'application/json',
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log('User Details:', data);
    } else {
      console.log('Error fetching user details');
    }
  };
  
  getUserDetails();
  