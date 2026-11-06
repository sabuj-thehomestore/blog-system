import { registerSchema, loginSchema, updateRoleSchema } from '../src/validations/auth.validation.js';
import { createPostSchema, updatePostSchema, queryPostSchema } from '../src/validations/post.validation.js';
import { createCommentSchema } from '../src/validations/comment.validation.js';

describe('Zod Validation Schemas Unit Tests', () => {
  test('registerSchema - validates valid registration payload', () => {
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    };
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  test('registerSchema - rejects invalid email', () => {
    const invalid = {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123'
    };
    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  test('createPostSchema - validates title and content length requirements', () => {
    const valid = {
      title: 'Valid Title Here',
      content: 'This content has more than ten characters easily.'
    };
    const result = createPostSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalidShortTitle = {
      title: 'No',
      content: 'Valid content but title is too short'
    };
    expect(createPostSchema.safeParse(invalidShortTitle).success).toBe(false);
  });

  test('createCommentSchema - rejects empty comment content', () => {
    expect(createCommentSchema.safeParse({ content: '' }).success).toBe(false);
    expect(createCommentSchema.safeParse({ content: 'Great post!' }).success).toBe(true);
  });

  test('updateRoleSchema - enforces valid enum roles', () => {
    expect(updateRoleSchema.safeParse({ role: 'admin' }).success).toBe(true);
    expect(updateRoleSchema.safeParse({ role: 'user' }).success).toBe(true);
    expect(updateRoleSchema.safeParse({ role: 'superhacker' }).success).toBe(false);
  });
});
