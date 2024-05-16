const express = require("express");
const bodyparser = require("body-parser");
const { default: db } = require("./config/config");
const app = express();
const dotenv = require("dotenv").config();
const auth = require("./router/authrouter");
const product = require("./router/productrouter");
const blog = require("./router/blogrout");
const morgan = require("morgan");
const cat = require("./router/productcategoryrouter");
const catblog = require("./router/blogcategory");
const brand = require("./router/brandrouter");
const coup = require("./router/coupenrouter");
const { notfound, errorhandel } = require("./middelware/errorhandel");
const color = require("./router/colorrouter");
const eqr = require("./router/enquiryrouter");
db();
const cookieparser = require("cookie-parser");
const four = require("./router/fournisseurrouter");
const cors = require('cors');

const corsConfig={
  origin:"*",
  Credential:true,
  methods:["GET","PUT","POST","DELETE"],
}
app.options("",cors(corsConfig))
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(cookieparser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use("/api/user", auth);
app.use("/api/fournisseur", four);
app.use("/api/coupon", coup);
app.use("/api/blogcategory", catblog);
app.use("/api/eqr",eqr );
app.use("/api/brand", brand);
app.use("/api/category", cat);
app.use("/api/product", product);
app.use("/api/blog", blog);
app.use("/api/color",color);
app.use(notfound);
app.use(errorhandel);
const PORT = process.env.PORT || 4000; // Utilise le port 4000 si la variable d'environnement PORT n'est pas définie

app.get("/", (req,res)=>{
  res.send ("say")
});
app.listen(PORT, () => {
  console.log(`mon serveur reserve le port ${PORT}`);
})
