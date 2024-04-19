const enq = require("../models/enqModel");

const asynchandeler = require("express-async-handler");


//update category
const updateenq = asynchandeler(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const update = await enq.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true }
    );
    res.json(update);
  } catch (error) {
    throw new Error(error);
  }
});
//reponse admin
const reponse = asynchandeler(async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const update = await enq.findByIdAndUpdate(
      id,
      {
        reponse: response,
      },
      { new: true }
    );
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
const addenq = async (req, res) => {
  try {
    const { _id } = req.user;
    const id = req.body; // Je suppose que req.body contient les données à créer
    const adcategory = await enq.create({ UserId: _id, ...id }); // Ajout de UserId et spread operator pour les données
    res.json(adcategory);
  } catch (error) {
    console.error(error); // Utilisation de console.error pour afficher l'erreur
    res.status(500).json({ error: 'Erreur lors de la création de l\'enquête' }); // Réponse d'erreur
  }
};

const getenq = async (req, res) => {
  try {
    
    const { id } = req.params;
    
    const getcategory = await enq.findById(id);
    res.json(getcategory);
  } catch (error) {
    console.error(error); // Utilisation de console.error pour afficher l'erreur
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'enquête' }); // Réponse d'erreur
  }
};
const getenqbyuser = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const enqery = await enq.find({ UserId: _id });
    res.json(enqery)
  } catch (error) {
    console.error(error); // Utilisation de console.error pour afficher l'erreur
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'enquête' }); // Réponse d'erreur
  }
};

//get all caegory
const getallenq = asynchandeler(async (req, res) => {
  try {
    const getcategory = await enq.find();
    res.json(getcategory);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = { addenq,getenqbyuser, updateenq, reponse, deleteenq, getenq, getallenq };
