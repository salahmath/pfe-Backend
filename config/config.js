const { default: mongoose } = require("mongoose")

const db =()=>{
  try{  const bdconnect = mongoose.connect(process.env.MONGO_URL || 4000) ;
  console.log("base de donnée connecter ")
  
}catch(ereor){
console.log("erreor de base de donnees ")
}}
exports.default= db;