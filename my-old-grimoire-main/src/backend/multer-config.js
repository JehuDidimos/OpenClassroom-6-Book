const multer = require("multer");
const path = require('path');

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    console.log(req.body);
    const name = file.originalname.split(" ").join("_").split('.')[0];
    const extension = MIME_TYPES[file.mimetype] || path.extname(file.originalname).slice(1)
    console.log(name);
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
