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
// app.use(
//   cors({
//     origin: "https://social-media-front-rho.vercel.app",
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

// const allowCrossDomain = function allowCrossDomain(req, res, next) {
//   console.log(">>>>>>>>>>");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "X-DAOMAKER, GOOGAPPUID, X-HACKERS, X-Parse-Master-Key, X-Parse-REST-API-Key, X-Parse-Javascript-Key, X-Parse-Application-Id, X-Parse-Client-Version, X-Parse-Session-Token, X-Requested-With, X-Parse-Revocable-Session, Content-Type, Cache-control, csrf-token, user-agent"
//   );
//   res.header("Access-Control-Expose-Headers", "Content-Disposition");
//   if ("OPTIONS" == req.method) {
//     // intercept OPTIONS method
//     res.sendStatus(200);
//   } else {
//     next();
//   }
// };

// app.use(allowCrossDomain);

app.use(function (req, res, next) {
  //Enabling CORS
  res.setHeader("Access-Control-Allow-Origin", "https://social-media-front-g6t6vqhxq-hsam02.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

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
