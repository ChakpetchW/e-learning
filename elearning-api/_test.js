const http = require('http');

const data = JSON.stringify({ email: 'user@company.com', password: 'user123' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const token = json.token;
    console.log("Token acquired.");
    
    // Fetch rewards
    http.get('http://localhost:5000/api/user/rewards', {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => console.log("Rewards Status:", res2.statusCode, "Body:", body2));
    });
  });
});

req.write(data);
req.end();
