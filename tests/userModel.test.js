const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const httpMocks = require('node-mocks-http');

jest.mock('../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpass');
      User.create.mockResolvedValue({});

      const req = httpMocks.createRequest({
        body: { name: 'John', email: 'john@example.com', password: '1234', role: 'user' }
      });
      const res = httpMocks.createResponse();

      await register(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual({ message: 'User registered successfully' });
    });

    it('should return 400 if user exists', async () => {
      User.findOne.mockResolvedValue({ email: 'john@example.com' });
      const req = httpMocks.createRequest({
        body: { email: 'john@example.com' }
      });
      const res = httpMocks.createResponse();

      await register(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'User already exists' });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { _id: '1', role: 'user', password: 'hashedpass' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('validtoken');

      const req = httpMocks.createRequest({
        body: { identifier: 'john@example.com', password: '1234' },
        params: { role: 'user' }
      });
      const res = httpMocks.createResponse();

      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ accessToken: 'validtoken' });
    });

    it('should return 404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const req = httpMocks.createRequest({
        body: { identifier: 'john@example.com', password: '1234' },
        params: { role: 'user' }
      });
      const res = httpMocks.createResponse();

      await login(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'User not found' });
    });
  });
});
