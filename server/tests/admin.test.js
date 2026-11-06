import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Admin Panel API & Role Guards', () => {
  let regularToken;
  let adminToken;
  let regularUserId;

  beforeEach(async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular Bob',
      email: 'bob@example.com',
      password: 'Password123!',
      role: 'user'
    });
    regularToken = userRes.body.data.accessToken;
    regularUserId = userRes.body.data.user.id;

    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin Boss',
      email: 'boss@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    adminToken = adminRes.body.data.accessToken;
  });

  test('GET /api/v1/admin/stats - blocks regular user with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/admin/stats - allows admin and returns statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalPosts');
    expect(res.body.data).toHaveProperty('totalComments');
  });

  test('PATCH /api/v1/admin/users/:id/role - allows admin to promote user to admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${regularUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('admin');
  });

  test('PATCH /api/v1/admin/users/:id/status - allows admin to deactivate user account', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${regularUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    // Verify deactivated user cannot log in
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'bob@example.com',
        password: 'Password123!'
      });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toContain('deactivated');
  });
});
