import { postService } from '../services/post.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, post, 'Post created successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { page, limit, search, tag } = req.query;
    const result = await postService.getPosts({ page, limit, search, tag });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'Posts retrieved successfully',
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

export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await postService.getPostBySlug(req.params.slug);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, post, 'Post retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.user, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, post, 'Post updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    await postService.softDeletePost(req.params.id, req.user);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Post deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const restorePost = async (req, res, next) => {
  try {
    const post = await postService.restorePost(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, post, 'Post restored successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const hardDeletePost = async (req, res, next) => {
  try {
    await postService.hardDeletePost(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Post permanently deleted')
    );
  } catch (error) {
    next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await postService.getUserPosts(req.user.id, { page, limit, includeDeleted: true });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'My posts retrieved successfully',
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
