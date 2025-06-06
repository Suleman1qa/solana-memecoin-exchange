import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return next(new AppError('Validation Error', 400, errorMessages));
  }
  next();
};

export { validate };
export default validate;