const Color = require("../models/color");

const asynchandeler = require("express-async-handler");

//ajout category
const addColor = asynchandeler(async (req, res) => {
  try {
    const id = req.body;
    const adcategory = await Color.create(id);
    res.json(adcategory);
  } catch (error) {
    throw new Error(error);
  }
});
//update category
const updatecolor = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const update = await Color.findByIdAndUpdate(id, req.body, { new: true });
    res.json(update);
  } catch (error) {
    throw new Error(error);
  }
});
//delete category
const deleteColor = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletee = await Color.findByIdAndDelete(id);
    res.json({
      msg: "user effacer avec succes",
    });
  } catch (error) {
    throw new Error(error);
  }
});
//get une category
const getColor = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const getcategory = await Color.findById(id);
    res.json(getcategory);
  } catch (error) {
    throw new Error(error);
  }
});
//get all caegory
const getallColor = asynchandeler(async (req, res) => {
  try {
    const getcategory = await Color.find();
    res.json(getcategory);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { addColor, updatecolor, deleteColor, getColor, getallColor };
