const jwt = require('jsonwebtoken')
const Refreshtoken = (id)=>{

    return jwt.sign({id},process.env.JWT,{expiresIn:"1d"})
}
module.exports={Refreshtoken};