const user = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT);
        const foundUser = await user.findById(decoded?.id);
        req.user = foundUser;
        next();
      }
    } catch (error) {
      throw new Error("Token invalide, veuillez vous connecter à nouveau");
    }
  } else {
    throw new Error("Aucun token attaché à la requête");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;

  const adminUser = await user.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("Vous n'êtes pas un administrateur");
  } else {
    next();
  }
});

const unblockuser = asyncHandler(async (req, res) => {
  const { id } = req.params;
 try{ const find =await user.findByIdAndUpdate(
    id,
    {
      isblocked: false,
    },
    {
      new: true,
    }
  );
  res.json({
    message:"utilisateur debloker"
  })
}catch(error){
throw new Error('impossible de blocker ce utilisateur ')


  }
}
);
const blockuser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try{ const find =await user.findByIdAndUpdate(
       id,
       {
         isblocked: true,
       },
       {
         new: false,
       }
     );
     res.json({
       message:"utilisateur bloker"
     })
   }catch(error){
   throw new Error('impossible de deblocker ce utilisateur ')
   
   
     }
});
module.exports = { authMiddleware, isAdmin, blockuser, unblockuser };
