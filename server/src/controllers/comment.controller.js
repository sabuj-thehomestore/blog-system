import { commentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createComment = async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const comment = await commentService.createComment(
      req.user.id,
      req.params.postId,
      req.body.content,
      io
    );

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, comment, 'Comment added successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await commentService.getCommentsByPost(req.params.postId, { page, limit });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'Comments retrieved successfully',
        {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(
      req.params.id,
      req.user,
      req.body.content
    );

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, comment, 'Comment updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.user);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Comment deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
