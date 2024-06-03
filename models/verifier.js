const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var enqSchema = new mongoose.Schema(
  {
    
    number: {
      type: String,
      required: true,
      unique: true
    },
    body: {
      type: String,
    },
  },
  { new: true }
);

//Export the model
module.exports = mongoose.model("Twilio", enqSchema);
