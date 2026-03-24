async function test() {
   try {
     let token;
     try {
       const login = await fetch('http://localhost:5000/api/auth/login', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
       });
       if (!login.ok) throw new Error('login failed');
       const data = await login.json();
       token = data.token;
     } catch(e) {
       const reg = await fetch('http://localhost:5000/api/auth/register', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: 'Test', email: 'test999@example.com', password: 'password123' })
       });
       const data = await reg.json();
       token = data.token;
     }
     const res = await fetch('http://localhost:5000/api/user/rewards', { headers: { Authorization: 'Bearer ' + token } });
     const text = await res.text();
     console.log('STATUS:', res.status);
     console.log('Success:', text);
   } catch(e) {
     console.error('API Error:', e.message);
   }
}
test();
