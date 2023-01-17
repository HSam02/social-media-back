import PostModel from "../models/posts.js";
import CommentModel from "../models/comments.js";

export const create = async (req, res) => {
  try {
    const { title, text, imageUrl } = req.body;
    const tags = req.body.tags.map(tag => tag = tag.trim());
    const doc = new PostModel({
      title,
      text,
      tags,
      imageUrl,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Post didn't create",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate({ path: "user", select: ["fullName", "avatarUrl"] })
      .exec();

    if (!posts) {
      return res.status(500).json({
        message: "Didn't find posts. DB error!",
      });
    }

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Posts didn't find",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    let findBy;
    if (req.query?.edit === "1") {
      findBy = PostModel.findById(req.params.id);
    } else {
      findBy = PostModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { viewsCount: 1 },
        },
        {
          returnDocument: "after",
        }
      );
    }
    const post = await findBy
      .populate({ path: "user", select: ["fullName", "avatarUrl"] })
      .populate({
        path: "comments",
        populate: { path: "user", select: ["fullName", "avatarUrl"] },
      })
      .exec();

    if (!post) {
      return res.status(500).json({
        message: "Post didn't find",
      });
    }

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Post didn't find, DB error!",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const deletedPost = await PostModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deletedPost) {
      return res.status(500).json({
        message: "Post didn't find",
      });
    }

    await CommentModel.deleteMany({ post: req.params.id });

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Post didn't find, DB error!",
    });
  }
};

export const update = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)
      .populate("user")
      .exec();
    if (post.user._id != req.userId) {
      return res.status(500).json({
        message: "No access",
      });
    }
    const { title, text, imageUrl } = req.body;
    const tags = req.body.tags.map(tag => tag = tag.trim());
    const updatedPost = await PostModel.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        title,
        text,
        tags,
        imageUrl,
      },
      {
        returnDocument: "after",
      }
    )
      .populate({ path: "user", select: ["fullName", "avatarUrl"] })
      .exec();

    if (!updatedPost) {
      return res.status(500).json({
        message: "Post didn't find",
      });
    }

    res.json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Post didn't find, DB error!",
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find({ tags: { $exists: true, $ne: [''] } }).sort("-createdAt").select("tags");
    let tags = [];
    for (let i = 0; i < posts.length; i++) {
      tags = tags.concat(posts[i].tags);
    }
    const lastTags = tags.filter((item, index) => tags.indexOf(item) === index);
    res.json(lastTags.slice(0, 3))
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Tags didn't find, DB error!",
    });
  }
}