const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
       UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      quantite:{
        type: Number,
       required: true,
      },
      color :[],
      price : {
        type: Number,
        required: true,
      },
    
    
   cartTotal :{},
    totalAfterDiscount: Number,
  },{
      timestamps: true
  });

//Export the model
module.exports = mongoose.model('Cart', cartSchema);