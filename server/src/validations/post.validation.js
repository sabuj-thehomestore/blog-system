import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string()).optional().default([]),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal(''))
});

export const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().url().optional().or(z.literal(''))
});

export const queryPostSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  tag: z.string().optional()
});
