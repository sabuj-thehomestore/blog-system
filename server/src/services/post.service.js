import { postRepository } from '../repositories/post.repository.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { generateSlug } from '../utils/slugify.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ROLES } from '../constants/index.js';

export class PostService {
  async createPost(authorId, { title, content, excerpt, tags, coverImage }) {
    const slug = generateSlug(title);

    // If excerpt not provided, generate from content
    const cleanExcerpt = excerpt || content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

    const post = await postRepository.create({
      title,
      slug,
      content,
      excerpt: cleanExcerpt,
      author: authorId,
      tags: tags || [],
      coverImage: coverImage || ''
    });

    return post;
  }

  async getPosts({ page = 1, limit = 10, search = '', tag = '', authorId = null }) {
    return postRepository.findActivePosts({ page, limit, search, tag, authorId });
  }

  async getPostBySlug(slug) {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }

    // Attach comments count
    const commentCount = await commentRepository.countByPost(post._id);
    return { ...post, commentCount };
  }

  async getPostById(postId) {
    const post = await postRepository.findById(postId);
    if (!post || post.isDeleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }
    return post;
  }

  async updatePost(postId, user, updateData) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }

    // RBAC: Admin can edit any post, regular user only their own
    if (user.role !== ROLES.ADMIN && post.author.toString() !== user.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this post');
    }

    if (updateData.title && updateData.title !== post.title) {
      updateData.slug = generateSlug(updateData.title);
    }

    if (updateData.content && !updateData.excerpt) {
      updateData.excerpt = updateData.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
    }

    const updatedPost = await postRepository.updateById(postId, updateData);
    return updatedPost;
  }

  async softDeletePost(postId, user) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }

    // RBAC: Admin can delete any post, regular user only their own
    if (user.role !== ROLES.ADMIN && post.author.toString() !== user.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this post');
    }

    if (post.isDeleted) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Post is already deleted');
    }

    return postRepository.softDelete(postId);
  }

  async restorePost(postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }

    return postRepository.restore(postId);
  }

  async hardDeletePost(postId) {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }

    // Also delete associated comments
    await commentRepository.model.deleteMany({ post: postId });
    return postRepository.deleteById(postId);
  }

  async getUserPosts(authorId, { page = 1, limit = 10, includeDeleted = false } = {}) {
    const filter = { author: authorId };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return postRepository.findPaginated({
      filter,
      page,
      limit,
      sort: { createdAt: -1 }
    });
  }
}

export const postService = new PostService();
