import axios from 'axios';

describe('API', () => {
  describe('GET /api', () => {
    it('should return a message', async () => {
      const res = await axios.get('/api');
      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      await expect(
        axios.post('/api/auth/login', {
          email: 'wrong@example.com',
          password: 'wrong',
        })
      ).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('should return access_token for valid credentials', async () => {
      const res = await axios.post('/api/auth/login', {
        email: 'owner@example.com',
        password: 'admin123',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe('owner@example.com');
    });
  });

  describe('GET /api/tasks', () => {
    let token: string;

    beforeAll(async () => {
      const res = await axios.post('/api/auth/login', {
        email: 'owner@example.com',
        password: 'admin123',
      });
      token = res.data.access_token;
    });

    it('should return 401 without token', async () => {
      await expect(axios.get('/api/tasks')).rejects.toMatchObject({
        response: { status: 401 },
      });
    });

    it('should return tasks with valid token', async () => {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });
});
