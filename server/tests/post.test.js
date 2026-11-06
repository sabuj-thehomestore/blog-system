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

describe('Post Management & RBAC Permissions', () => {
  let userToken;
  let anotherUserToken;
  let adminToken;

  beforeEach(async () => {
    // Register regular user 1
    const user1 = await request(app).post('/api/v1/auth/register').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'Password123!',
      role: 'user'
    });
    userToken = user1.body.data.accessToken;

    // Register regular user 2
    const user2 = await request(app).post('/api/v1/auth/register').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'Password123!',
      role: 'user'
    });
    anotherUserToken = user2.body.data.accessToken;

    // Register admin user
    const admin = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    adminToken = admin.body.data.accessToken;
  });

  test('POST /api/v1/posts - authenticated user can create a post with auto slug', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'First Test Post on Antigravity',
        content: 'This is the body content of our test post that has more than 10 characters.',
        tags: ['tech', 'antigravity']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data.slug).toContain('first-test-post-on-antigravity');
    expect(res.body.data.isDeleted).toBe(false);
  });

  test('GET /api/v1/posts - retrieves public paginated list of posts', async () => {
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Post to fetch',
        content: 'Testing list retrieval with pagination.'
      });

    const res = await request(app).get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  test('PUT /api/v1/posts/:id - author can update their own post', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Original Title',
        content: 'Original content description.'
      });

    const postId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Updated Title'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  test('PUT /api/v1/posts/:id - other user CANNOT update someone elses post (RBAC 403)', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User 1 Post',
        content: 'User 1 content belongs exclusively to user 1.'
      });

    const postId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({
        title: 'Malicious modification attempt'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/v1/posts/:id - admin CAN update any users post (RBAC 200)', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User 1 Post for Admin',
        content: 'Content that will be moderated by admin.'
      });

    const postId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Moderated Title by Admin'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Moderated Title by Admin');
  });

  test('DELETE /api/v1/posts/:id - soft deletes post and excludes it from public feed', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Post to be soft deleted',
        content: 'Content of post to be soft deleted.'
      });

    const postId = createRes.body.data._id;

    // Delete post
    const deleteRes = await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.status).toBe(200);

    // Verify it is excluded from public listing
    const listRes = await request(app).get('/api/v1/posts');
    expect(listRes.body.data.length).toBe(0);
  });
});
