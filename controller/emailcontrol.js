const AsyncHandler = require("express-async-handler");
const nodemailer = require('nodemailer');

const sendEmail = AsyncHandler (async (data,req,res)=>{


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user:process.env.EMAIL,
      pass: "vzyp enpy cdud ttty"
    },
  });
   let info = await transporter.sendMail({
      from: '"hey 👻" <abc@example.com>', // sender address
      to: data.to, // list of receivers
      subject: data.subject, // Subject line
      text: data.text, // plain text body
      html: data.htm, // html body
   
    
  });
  console.log("Message sent: %s", info.messageId);
  })
  module.exports = sendEmail;