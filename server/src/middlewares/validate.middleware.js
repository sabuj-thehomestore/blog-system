import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', errorMessages));
    }
    req[source] = result.data;
    next();
  } catch (error) {
    next(error);
  }
};
