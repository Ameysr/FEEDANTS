import request from 'supertest';
import { createApp } from '../app';
import { API } from './helpers';

const app = createApp();

describe('Auth API', () => {
  const credentials = { name: 'Test User', email: 'test.user@example.com', password: 'Password123' };

  it('registers a new user and returns a token + public profile', async () => {
    const res = await request(app).post(`${API}/auth/register`).send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ name: credentials.name, email: credentials.email });
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with 409 EMAIL_TAKEN', async () => {
    await request(app).post(`${API}/auth/register`).send(credentials);
    const res = await request(app).post(`${API}/auth/register`).send(credentials);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects an invalid email with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...credentials, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ path: 'email' })]));
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...credentials, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with correct credentials', async () => {
    await request(app).post(`${API}/auth/register`).send(credentials);
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
  });

  it('rejects wrong credentials with 401 INVALID_CREDENTIALS', async () => {
    await request(app).post(`${API}/auth/register`).send(credentials);
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: credentials.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('does not reveal whether an email exists', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'ghost@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  describe('GET /auth/me', () => {
    it('returns the current user with a valid token', async () => {
      const register = await request(app).post(`${API}/auth/register`).send(credentials);
      const token = register.body.data.accessToken;

      const res = await request(app).get(`${API}/auth/me`).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(credentials.email);
    });

    it('rejects a missing token with 401', async () => {
      const res = await request(app).get(`${API}/auth/me`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects a malformed token with 401', async () => {
      const res = await request(app).get(`${API}/auth/me`).set('Authorization', 'Bearer nonsense.token.here');
      expect(res.status).toBe(401);
    });
  });
});
