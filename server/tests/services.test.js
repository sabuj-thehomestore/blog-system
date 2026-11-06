import { jest } from '@jest/globals';
import { PostService } from '../src/services/post.service.js';
import { AdminService } from '../src/services/admin.service.js';
import { ROLES, HTTP_STATUS } from '../src/constants/index.js';

describe('Service Layer Business Logic Tests', () => {
  describe('PostService', () => {
    let postService;
    let mockPostRepo;
    let mockCommentRepo;

    beforeEach(() => {
      postService = new PostService();
    });

    test('updatePost - allows author to update title and generates new slug', async () => {
      const mockPost = {
        _id: 'post1',
        title: 'Old Title',
        author: 'user123',
        content: 'Original content here.'
      };

      const mockUpdatedPost = {
        _id: 'post1',
        title: 'New Title',
        author: 'user123',
        slug: 'new-title-abc123'
      };

      const spyFindById = jest.spyOn(postService, 'getPostById').mockImplementation();
      // Mock repository via module or object
      const user = { id: 'user123', role: ROLES.USER };
    });

    test('softDeletePost - rejects deletion if user is not author and not admin', async () => {
      const mockPost = {
        _id: 'post1',
        title: 'Target Post',
        author: 'victim123',
        isDeleted: false
      };

      // Mock postRepository
      const { postRepository } = await import('../src/repositories/post.repository.js');
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);

      const attackerUser = { id: 'attacker456', role: ROLES.USER };

      await expect(postService.softDeletePost('post1', attackerUser)).rejects.toThrow(
        'You are not authorized to delete this post'
      );
    });

    test('softDeletePost - allows admin to soft-delete any post', async () => {
      const mockPost = {
        _id: 'post1',
        title: 'Target Post',
        author: 'user123',
        isDeleted: false
      };

      const { postRepository } = await import('../src/repositories/post.repository.js');
      jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);
      jest.spyOn(postRepository, 'softDelete').mockResolvedValue({ ...mockPost, isDeleted: true });

      const adminUser = { id: 'admin999', role: ROLES.ADMIN };

      const result = await postService.softDeletePost('post1', adminUser);
      expect(result.isDeleted).toBe(true);
    });
  });

  describe('AdminService', () => {
    let adminService;

    beforeEach(() => {
      adminService = new AdminService();
    });

    test('updateUserRole - prevents admin from removing admin role from themselves', async () => {
      await expect(
        adminService.updateUserRole('admin123', ROLES.USER, 'admin123')
      ).rejects.toThrow('You cannot remove the admin role from yourself');
    });

    test('updateUserStatus - prevents admin from deactivating their own account', async () => {
      await expect(
        adminService.updateUserStatus('admin123', false, 'admin123')
      ).rejects.toThrow('You cannot deactivate your own admin account');
    });
  });
});
