const Blog = require("../models/blougmodel");
const asynchandeler = require("express-async-handler");
const validation = require("../utils/validationMongodb");
const user = require("../models/usermodel");
const cloudinaryUploadImage = require('../utils/cloudbinary')
//cree un blog
const creatblog = asynchandeler(async (req, res) => {
  try {
    const createBlog = await Blog.create(req.body);
    res.json(createBlog);
  } catch (error) {
    throw new Error(error);
  }
});
//update a blog
const updateBlog = asynchandeler(async (req, res) => {
  const { id } = req.params;
  try {
    const update = await Blog.findByIdAndUpdate(
      id,

      req.body,

      { new: true }
    );
    res.json({
      msg: "user update avec success",
    });
  } catch (error) {
    throw new Error(error);
  }
});
//get a blog
const getBlog = asynchandeler(async (req, res) => {
  const { id } = req.params;
  try {
    const getblog = await Blog.findById(id)
      .populate("likes")
      .populate("dilikes");
    const updateView = await Blog.findByIdAndUpdate(id, {
      $inc: { numViews: 1 },
    });
    res.json(getblog);
  } catch (error) {
    throw new Error(error);
  }
});
//get tout les blog

const getallblog = asynchandeler(async (req, res) => {
  try {
    const getalblog = await Blog.find();
    res.json(getalblog);
  } catch (error) {
    throw new Error(error);
  }
});
//delete a blog
const deleteBlog = asynchandeler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteblo = await Blog.findByIdAndDelete(id);
    res.json({
      msg: "user delete avec success",
    });
  } catch (error) {
    throw new Error(error);
  }
});

//like the blog
const likeblogs = asynchandeler(async (req, res) => {
  const { blogid } = req.body;
  validation(blogid);
  const blog = await Blog.findById(blogid);
  const loginID = req?.user?._id;
  const isliked = blog?.isliked;
  const alreadydisliked = blog?.dilikes?.find(
    (userID) => userID?.toString() === loginID?.toString()
  );
  if (alreadydisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $pull: { dilikes: loginID },
        isdisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $pull: { likes: loginID },
        isliked: false,
      },
      { new: true }
    );

    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $push: { likes: loginID },
        isliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});
//dislike the blog
const dislikeblogs = asynchandeler(async (req, res) => {
  const { blogid } = req.body;
  validation(blogid);
  const blog = await Blog.findById(blogid);
  const loginID = req?.user?._id;
  const isdisliked = blog?.isdisliked;
  const alreadyliked = blog?.likes?.find(
    (userID) => userID?.toString() === loginID?.toString()
  );
  if (alreadyliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $pull: { likes: loginID },
        isliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isdisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $pull: { dilikes: loginID },
        isdisliked: false,
      },
      { new: true }
    );

    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogid,
      {
        $push: { dilikes: loginID },
        isdisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});
const uploadblogimage = asynchandeler(async(req,res)=>{
  const{id}=req.params;
  validation(id);
  try{
    const uploader = (path) => cloudinaryUploadImage(path, 'images');
    const urls=[];
    const files = req.files;
    for(const file of files){
      const {path}=file;
      const newpath = await uploader(path);
      urls.push(newpath);
    }
     const findProduct = await Blog.findByIdAndUpdate(id,{
      image: urls.map((file)=>{
        return file;
      }),
     })
  res.json(findProduct);
  }catch(error){
    throw new Error(error)
  }
  
})
module.exports = {
  creatblog,
  updateBlog,
  getBlog,
  getallblog,
  deleteBlog,
  likeblogs,
  uploadblogimage,
  dislikeblogs,
};
