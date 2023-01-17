import express from "express";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";

import {
  commentValidation,
  loginValidation,
  postCreateValidation,
  postUpdateValidation,
  registerValidation,
} from "./validations.js";

import {
  CommentController,
  PostController,
  UserController,
  FileController,
} from "./controllers/index.js";
import { checkAuth, handleValidationErrors } from "./utils/index.js";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB ok"))
  .catch((err) => console.log(`DB error: ${err}`));
  
  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));
  app.use(cors());
  
const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    if (fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    const fileNewName = `${
      req.userId || "avatar" + Math.random()
    }_${Date.now()}.${file.originalname.split(".").pop()}`;
    callback(null, fileNewName);
  },
});

const upload = multer({ storage });


app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.get("/auth/user", checkAuth, UserController.getUser);

app.delete("/uploads/:fileName", checkAuth, FileController.deleteImg);

app.post(
  "/uploads",
  checkAuth,
  upload.single("image"),
  FileController.uploadImg
);

app.post("/upload-avatar", upload.single("image"), FileController.uploadAvatar);

app.delete("/upload-avatar/:fileName", FileController.deleteAvatar);

app.get("/last-tags", PostController.getLastTags);

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postUpdateValidation,
  handleValidationErrors,
  PostController.update
);

app.get("/comments", CommentController.getLast3);
app.get("/comments/:id", CommentController.getAll);
app.post(
  "/comments",
  checkAuth,
  commentValidation,
  handleValidationErrors,
  CommentController.create
);

app.listen(process.env.PORT || 5555, (error) => {
  if (error) {
    return console.log(error);
  }

  console.log("Server ok");
});
