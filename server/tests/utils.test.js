import { generateSlug } from '../src/utils/slugify.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../src/utils/token.js';
import { ApiError } from '../src/utils/ApiError.js';
import { ApiResponse } from '../src/utils/ApiResponse.js';

describe('Utility Functions Unit Tests', () => {
  test('generateSlug - creates URL friendly slug with unique suffix', () => {
    const title = 'Hello World! How Are You Today?';
    const slug = generateSlug(title);

    expect(slug).toMatch(/^hello-world-how-are-you-today-[a-z0-9]+$/);
  });

  test('generateSlug - handles special characters and leading/trailing dashes', () => {
    const title = '--- Special @#$% Characters ---';
    const slug = generateSlug(title);

    expect(slug).toMatch(/^special-characters-[a-z0-9]+$/);
  });

  test('JWT Tokens - generates and verifies access tokens', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    };

    const token = generateAccessToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(mockUser._id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
  });

  test('JWT Tokens - generates and verifies refresh tokens', () => {
    const mockUser = { _id: '507f1f77bcf86cd799439011' };

    const token = generateRefreshToken(mockUser);
    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(mockUser._id);
  });

  test('ApiError - structures error responses correctly', () => {
    const err = new ApiError(404, 'Post not found', [{ field: 'id', message: 'invalid id' }]);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Post not found');
    expect(err.success).toBe(false);
    expect(err.errors.length).toBe(1);
  });

  test('ApiResponse - structures success responses correctly with meta', () => {
    const res = new ApiResponse(200, { title: 'Post 1' }, 'Fetched', { page: 1, limit: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.success).toBe(true);
    expect(res.message).toBe('Fetched');
    expect(res.meta.page).toBe(1);
  });
});
