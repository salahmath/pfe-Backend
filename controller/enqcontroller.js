const enq = require("../models/enqModel");

const asynchandeler = require("express-async-handler");

//ajout category
const addenq = asynchandeler(async (req, res) => {
  try {
    const id = req.body;
    const adcategory = await enq.create(id);
    res.json(adcategory);
  } catch (error) {
    throw new Error(error);
  }
});
//update category
const updateenq = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const update = await enq.findByIdAndUpdate(id, req.body, { new: true });
    res.json(update);
  } catch (error) {
    throw new Error(error);
  }
});
//delete category
const deleteenq = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletee = await enq.findByIdAndDelete(id);
    res.json({
      msg: "user effacer avec succes",
    });
  } catch (error) {
    throw new Error(error);
  }
});
//get une category
const getenq = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const getcategory = await enq.findById(id);
    res.json(getcategory);
  } catch (error) {
    throw new Error(error);
  }
});
//get all caegory
const getallenq = asynchandeler(async (req, res) => {
  try {
    const getcategory = await enq.find();
    res.json(getcategory);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { addenq, updateenq, deleteenq, getenq, getallenq };
