import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, avatarUrl } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      fullName,
      email,
      passwordHash: hash,
      avatarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "bdnhdfnbdsub",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "User didn't create",
      error
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "Incorrect email or password",
      });
    }

    const isValidPass = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPass) {
      return res.status(404).json({
        message: "Incorrect email or password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "bdnhdfnbdsub",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can't login",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User didn't find",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Can't get info",
    });
  }
};
