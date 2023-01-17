import { body } from "express-validator";

export const registerValidation = [
  body("email", "Invalid email").isEmail(),
  body("password", "Invalid password").isLength({ min: 8 }),
  body("fullName", "Invalid name").isLength({ min: 3 }),
  body("avatarUrl", "Invalid url").optional().isString(),
];

export const loginValidation = [
  body("email", "Invalid email").isEmail(),
  body("password", "Invalid password").isLength({ min: 8 }),
];

export const postCreateValidation = [
  body("title", "Invalid title").isLength({ min: 3 }).isString(),
  body("text", "Invalid text").isLength({ min: 10 }).isString(),
  body("tags", "Invalid tags").optional().isArray(),
  body("imageUrl", "Invalid url").optional().isString(),
];

export const postUpdateValidation = [
  body("title", "Invalid title").optional().isLength({ min: 3 }).isString(),
  body("text", "Invalid text").optional().isLength({ min: 10 }).isString(),
  body("tags", "Invalid tags").optional().isArray(),
  body("imageUrl", "Invalid url").optional().isString(),
];

export const commentValidation = [
  body("text", "Invalid text").isLength({ min: 3 }).isString(),
  body("postId", "Invalid Posts id").isMongoId()
];