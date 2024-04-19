const mongoose = require('mongoose');

// Déclaration du schéma du modèle MongoDB
const cartSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantite: {
    type: Number,
    required: true,
  },
  color: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
  }],
  price: {
    type: Number,
    required: true,
  },
  totalCartPrice: {
    type: Number,
    default: function () {
      return this.price; // Valeur par défaut du prix total est le prix initial
    }
  }
}, {
  timestamps: true
});

// Export du modèle
module.exports = mongoose.model('Cart', cartSchema);
