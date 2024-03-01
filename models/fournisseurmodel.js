const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var fournisseurSchema = new mongoose.Schema({
    lastname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    Secondname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
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