import { BaseRepository } from './base.repository.js';
import { Comment } from '../models/Comment.js';

export class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }

  async findByPostId(postId, { page = 1, limit = 20, includeDeleted = false } = {}) {
    const filter = { post: postId };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    return this.findPaginated({
      filter,
      page,
      limit,
      sort: { createdAt: 1 },
      populate: [{ path: 'author', select: 'name email avatar' }]
    });
  }

  async countByPost(postId) {
    return this.model.countDocuments({ post: postId, isDeleted: false });
  }

  async countActive() {
    return this.model.countDocuments({ isDeleted: false });
  }
}

export const commentRepository = new CommentRepository();
