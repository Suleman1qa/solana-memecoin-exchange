import { validationResult } from "express-validator";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";

const validate = (req, res, next) => {
  // Log incoming request
  logger.debug("Validate middleware: Request received", {
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });
  console.log("Validate middleware: Request received", {
    path: req.path,
    method: req.method,
    body: req.body,
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));

    // Log validation errors
    logger.warn("Validation Error", { errors: errorMessages });
    console.log("Validation Error:", errorMessages);

    return next(new AppError("Validation Error", 400, errorMessages));
  }

  // Log successful validation
  logger.debug("Validation successful");
  console.log("Validation successful");
  next();
};

export { validate };
export default validate;
