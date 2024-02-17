const multer = require("multer");
const sharp = require("sharp");
const path = require("path");


const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, "../public/images");
    
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.fieldname + "-" + uniqueSuffix + ".jpeg";
    console.log("Generated Filename:", fileName);
    cb(null, fileName);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    
    cb(null, true)
  } else {
    
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadphoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 200000 }, // Correction
});



const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
 
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/produit/${file.filename}`);
    })
  );
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
 
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};


module.exports = {
  uploadphoto,
  productImgResize,
  blogImgResize,
  
};
