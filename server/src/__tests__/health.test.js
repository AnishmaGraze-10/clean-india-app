const request = require('supertest');
const app = require('../app');

describe('Health endpoint', () => {
  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Server is running');
  });
});
