const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      
      quantite:{
        type: Number,
       required: true,
      },
      color :[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
      }],
      price : {
        type: Number,
        required: true,
      },
    totalCartPrice: []
  },{
      timestamps: true
  });

//Export the model
module.exports = mongoose.model('Cart', cartSchema);