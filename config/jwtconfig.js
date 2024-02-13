const jwt = require('jsonwebtoken')
const generatetoken = (id)=>{

    return jwt.sign({id},process.env.JWT,{expiresIn:"3d"})
}
module.exports={generatetoken};