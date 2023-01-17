import fs from "fs";

export const uploadImg = (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
};

export const uploadAvatar = (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
};

export const deleteAvatar = (req, res) => {
  fs.unlink(`./uploads/${req.params.fileName}`, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Could not delete the file",
      });
    }

    res.json({
      message: "File is deleted",
    });
  });
};

export const deleteImg = (req, res) => {
  const fileName = req.params.fileName;
  const userId = fileName.split("_")[0];
  if (userId !== req.userId) {
    return res.status(403).json({
      message: "No access",
    });
  }
  fs.unlink(`./uploads/${fileName}`, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Could not delete the file",
      });
    }

    res.json({
      message: "File is deleted",
    });
  });
};
