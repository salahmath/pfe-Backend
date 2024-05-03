const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require ('crypto');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
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
    password:{
        type:String,
        required:true,
    },
    isblocked:{
    type : Boolean,
    default:false,
    },
    role:{
        type:String,
        default:"utilisateur",
    },
    cart:[{type: mongoose.Schema.Types.ObjectId  , ref:"Cart"}],
    address:{
        type : String
    },
    wishlist: [{type: mongoose.Schema.Types.ObjectId  , ref:"Product"}],
    refrechToken:{
        type : String,
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordRessetExpires: Date,
},
{
    timestamps : true,

});
 userSchema.pre('save', async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password,salt);
    next()
 });
userSchema.methods.isPasswordMatched = async function (enterpassword){
    return await bcrypt.compare(enterpassword,this.password);
};
userSchema.methods.createPasswordResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordRessetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes d'expiration pour le jeton
    await this.save(); // Sauvegardez les modifications dans la base de données
    return resetToken;
  };
  
module.exports = mongoose.model('User', userSchema);