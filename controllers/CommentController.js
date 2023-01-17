import CommentModel from "../models/comments.js";
import PostModel from "../models/posts.js";

export const create = async (req, res) => {
  try {

    let post = await PostModel.findById(req.body.postId);
    if (!post) {
      res.status(500).json({
        message: "Post didn't find",
      });
    }

    const doc = new CommentModel({
      user: req.userId,
      post: req.body.postId,
      text: req.body.text,
    });

    const newComment = await doc.save();

    await PostModel.findOneAndUpdate(
      { _id: req.body.postId },
      { $push: {comments: newComment._id} }
    );
    
    const comment = await CommentModel.findById(newComment._id).populate({path: "user", select: ["fullName", "avatarUrl"]})

    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Comment didn't create",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate({path: "comments", populate: {path: "user", select: ["fullName", "avatarUrl"]}}).exec()
    res.json(post.comments)
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Comments didn't find",
    });
  }
}

export const getLast3 = async (req, res) => {
  try {
    const comments = await CommentModel.find().sort("-createdAt").limit(3).populate({path: "user", select: ["fullName", "avatarUrl"]}).exec();
    res.json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Comments didn't find",
    });
  }
}