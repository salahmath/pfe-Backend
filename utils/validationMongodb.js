const mongoose = require("mongoose")
const validation=(id)=>{
const validMongoose =mongoose.Types.ObjectId.isValid(id);
if(!validMongoose)throw new Error ('cette id ne pas valider ou ne pas trouver');

}
module.exports = validation;
