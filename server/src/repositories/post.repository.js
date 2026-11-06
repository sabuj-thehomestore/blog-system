import { BaseRepository } from './base.repository.js';
import { Post } from '../models/Post.js';

export class PostRepository extends BaseRepository {
  constructor() {
    super(Post);
  }

  async findBySlug(slug, includeDeleted = false) {
    const filter = { slug };
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    return this.model
      .findOne(filter)
      .populate('author', 'name email avatar role')
      .lean();
  }

  async findActivePosts({ page = 1, limit = 10, search = '', tag = '', authorId = null }) {
    const filter = { isDeleted: false };

    if (search) {
      filter.$text = { $search: search };
    }

    if (tag) {
      filter.tags = tag;
    }

    if (authorId) {
      filter.author = authorId;
    }

    return this.findPaginated({
      filter,
      page,
      limit,
      sort: search ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
      populate: [{ path: 'author', select: 'name email avatar' }]
    });
  }

  async findAllPostsAdmin({ page = 1, limit = 10, isDeleted = null, search = '' }) {
    const filter = {};
    if (isDeleted !== null && isDeleted !== undefined) {
      filter.isDeleted = isDeleted === true || isDeleted === 'true';
    }
    if (search) {
      filter.$text = { $search: search };
    }

    return this.findPaginated({
      filter,
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [{ path: 'author', select: 'name email role' }]
    });
  }

  async countActive() {
    return this.model.countDocuments({ isDeleted: false });
  }

  async countTotal() {
    return this.model.countDocuments();
  }
}

export const postRepository = new PostRepository();
