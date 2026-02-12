const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };

    try {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err.message);
        reject(err);
      });

      req.on('timeout', () => {
        console.error('Request timeout');
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    } catch (err) {
      console.error('Error in request:', err.message);
      reject(err);
    }
  });
}

async function runTests() {
  console.log('\n🧪 Testing Clean India App Authentication\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Health Check');
    try {
      const health = await makeRequest('GET', '/api/health');
      console.log(`Status: ${health.status}`);
      console.log(`Response: ${health.body}`);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
      process.exit(1);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Server is responsive!\n');

    // --- Full auth flow ---
    // Register regular user
    console.log('\n2️⃣ Register Regular User');
    const registerRes = await makeRequest('POST', '/api/auth/register', {
      name: 'John Citizen',
      email: 'john@example.com',
      password: 'securepass123'
    });
    console.log(`Status: ${registerRes.status}`);
    console.log(`Body: ${registerRes.body}`);
    let userToken = '';
    try { userToken = JSON.parse(registerRes.body).token; } catch(e){}

    // Login regular user
    console.log('\n3️⃣ Login Regular User');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'john@example.com',
      password: 'securepass123'
    });
    console.log(`Status: ${loginRes.status}`);
    console.log(`Body: ${loginRes.body}`);
    try { userToken = JSON.parse(loginRes.body).token || userToken; } catch(e){}

    // Get profile WITHOUT token (expect 401)
    console.log('\n4️⃣ Get Profile WITHOUT Token (expect 401)');
    const noTokenRes = await makeRequest('GET', '/api/user/profile');
    console.log(`Status: ${noTokenRes.status}`);
    console.log(`Body: ${noTokenRes.body}`);

    // Get profile WITH token (expect 200)
    console.log('\n5️⃣ Get Profile WITH Token (expect 200)');
    const profileRes = await makeRequest('GET', '/api/user/profile', null, { Authorization: `Bearer ${userToken}` });
    console.log(`Status: ${profileRes.status}`);
    console.log(`Body: ${profileRes.body}`);

    // Try admin registration WITHOUT admin key (expect 403)
    console.log('\n6️⃣ Register Admin WITHOUT ADMIN_KEY (expect 403)');
    const adminNoKeyRes = await makeRequest('POST', '/api/auth/register-admin', { name: 'Admin Officer', email: 'admin@example.com', password: 'adminpass123' });
    console.log(`Status: ${adminNoKeyRes.status}`);
    console.log(`Body: ${adminNoKeyRes.body}`);

    // Register admin WITH admin key
    console.log('\n7️⃣ Register Admin WITH ADMIN_KEY');
    const adminRegisterRes = await makeRequest('POST', '/api/auth/register-admin', { name: 'Admin Officer', email: 'admin@example.com', password: 'adminpass123' }, { 'x-admin-key': 'adminkey123' });
    console.log(`Status: ${adminRegisterRes.status}`);
    console.log(`Body: ${adminRegisterRes.body}`);
    let adminToken = '';
    try { adminToken = JSON.parse(adminRegisterRes.body).token; } catch(e){}
    if (!adminToken) {
      // If admin already exists (or register failed), try logging in to get token
      const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'admin@example.com', password: 'adminpass123' });
      try { adminToken = JSON.parse(adminLogin.body).token; } catch(e){}
    }

    // Access admin dashboard WITH user token (expect 403)
    console.log('\n8️⃣ Access Admin Dashboard WITH User Token (expect 403)');
    const adminUserRes = await makeRequest('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${userToken}` });
    console.log(`Status: ${adminUserRes.status}`);
    console.log(`Body: ${adminUserRes.body}`);

    // Access admin dashboard WITH admin token (expect 200)
    console.log('\n9️⃣ Access Admin Dashboard WITH Admin Token (expect 200)');
    const adminOkRes = await makeRequest('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${adminToken}` });
    console.log(`Status: ${adminOkRes.status}`);
    console.log(`Body: ${adminOkRes.body}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Full auth flow completed');

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

runTests();

