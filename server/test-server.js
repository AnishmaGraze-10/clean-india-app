console.log('Starting test...');

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log('Making request to:', options.hostname + ':' + options.port + options.path);

const req = http.request(options, (res) => {
  console.log('Response received, status:', res.statusCode);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  console.error('Error details:', error);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
  process.exit(1);
});

console.log('Sending request...');
req.end();
console.log('Request sent');
