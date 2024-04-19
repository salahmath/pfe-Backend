const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var enqSchema = new mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "en attente",
      enum: ["en attente", "voir", "repondre"],
    },
    reponse: {
      type: String,
    },
  },
  { new: true }
);

//Export the model
module.exports = mongoose.model("Enq", enqSchema);
