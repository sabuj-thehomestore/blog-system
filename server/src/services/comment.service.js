import { commentRepository } from '../repositories/comment.repository.js';
import { postRepository } from '../repositories/post.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ROLES } from '../constants/index.js';

export class CommentService {
  async createComment(authorId, postId, content, io = null) {
    const post = await postRepository.findById(postId);
    if (!post || post.isDeleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found or has been removed');
    }

    const comment = await commentRepository.create({
      post: postId,
      author: authorId,
      content
    });

    const populatedComment = await comment.populate('author', 'name email avatar');

    // Real-time notification if socket io is provided and post author is not the commenter
    if (io && post.author.toString() !== authorId.toString()) {
      io.to(`user_${post.author.toString()}`).emit('new_comment_notification', {
        type: 'COMMENT',
        post: { id: post._id, title: post.title, slug: post.slug },
        comment: {
          id: populatedComment._id,
          content: populatedComment.content,
          author: populatedComment.author
        },
        createdAt: new Date()
      });
    }

    return populatedComment;
  }

  async getCommentsByPost(postId, { page = 1, limit = 20 }) {
    const post = await postRepository.findById(postId);
    if (!post || post.isDeleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
    }
    return commentRepository.findByPostId(postId, { page, limit });
  }

  async updateComment(commentId, user, content) {
    const comment = await commentRepository.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    // Only comment author can edit comment content
    if (comment.author.toString() !== user.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only edit your own comment');
    }

    return commentRepository.updateById(
      commentId,
      { content },
      { new: true }
    );
  }

  async deleteComment(commentId, user) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
    }

    // Admin can delete any comment, regular user only their own
    if (user.role !== ROLES.ADMIN && comment.author.toString() !== user.id) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this comment');
    }

    return commentRepository.softDelete(commentId);
  }
}

export const commentService = new CommentService();
