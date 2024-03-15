const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var fournisseurSchema = new mongoose.Schema({
    lastname:{
        type:String,
        required:true,
        index:true,
    },
    Secondname:{
        type:String,
        required:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                // Vérifie si la valeur de mobile a au moins 8 chiffres
                return value.toString().length >= 8;
            },
            message: props => `Le numéro de mobile doit avoir au moins 8 chiffres.`
        }
    },
    
    
    role:{
        type:String,
        default:"fournissseur",
    },
    
    address: {
        type:String,
    }, 
    
    

},
{
    timestamps : true,

});

//Export the model
module.exports = mongoose.model('Fournisseur', fournisseurSchema);