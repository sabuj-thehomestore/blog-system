import { jest } from '@jest/globals';
import { requireRole, requireOwnerOrAdmin } from '../src/middlewares/rbac.middleware.js';
import { ROLES, HTTP_STATUS } from '../src/constants/index.js';

describe('RBAC Middleware Unit Tests', () => {
  let mockReq;
  let mockRes;
  let nextFn;

  beforeEach(() => {
    mockRes = {};
    nextFn = jest.fn();
  });

  test('requireRole - allows user with authorized role', () => {
    mockReq = {
      user: { id: 'user123', role: ROLES.ADMIN }
    };

    const middleware = requireRole(ROLES.ADMIN);
    middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
  });

  test('requireRole - blocks user with unauthorized role with 403 Forbidden', () => {
    mockReq = {
      user: { id: 'user123', role: ROLES.USER }
    };

    const middleware = requireRole(ROLES.ADMIN);
    middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    const errorArg = nextFn.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
  });

  test('requireOwnerOrAdmin - allows Admin regardless of resource owner', async () => {
    mockReq = {
      user: { id: 'admin123', role: ROLES.ADMIN }
    };

    const getResource = jest.fn().mockResolvedValue({ author: 'otherUser' });
    const middleware = requireOwnerOrAdmin(getResource);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
    expect(getResource).not.toHaveBeenCalled();
  });

  test('requireOwnerOrAdmin - allows regular user if they own the resource', async () => {
    mockReq = {
      user: { id: 'owner123', role: ROLES.USER }
    };

    const getResource = jest.fn().mockResolvedValue({ author: 'owner123' });
    const middleware = requireOwnerOrAdmin(getResource);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
    expect(mockReq.resource).toBeDefined();
  });

  test('requireOwnerOrAdmin - blocks regular user if they do NOT own the resource (403 Forbidden)', async () => {
    mockReq = {
      user: { id: 'attacker123', role: ROLES.USER }
    };

    const getResource = jest.fn().mockResolvedValue({ author: 'victim123' });
    const middleware = requireOwnerOrAdmin(getResource);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    const errorArg = nextFn.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    expect(errorArg.message).toContain('only modify or delete your own resources');
  });
});
