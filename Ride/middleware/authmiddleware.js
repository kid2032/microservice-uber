// const jwt= require("jsonwebtoken");
// const userModel = require("../model/user.model");


// const AuthMiddleware=async(req,res,next)=>{
//     try {
//         const ubertoken = req.cookies.ubertoken
//         if (!ubertoken) return res.status(401).send("Access Denid");

//          jwt.verify(ubertoken,"helloimtoken",async(err,data)=>{
//             if (err) {
//                 const user= await userModel.updateOne({"_id":data._id},
//                     {
//                         $pull:{
//                             tokens:ubertoken
//                         }
//                     }
//                 )
//                 if(!user){
//                     return res.status(401).json({ error: "User Not Found" });

//                 }
//                 if (err.name === "TokenExpiredError") {
//                     return res.status(401).json({ error: "Token expired" });
//                 }
//                 return res.status(403).json({ error: "Invalid token" });
//             }
//             req._id=data._id
//             req.email=data.email
//             req.role=data.role
//             next()
//          })


//     } catch (error) {
//         res.status(500).send("Internal Server Error");

//     }
// }

// module.exports=AuthMiddleware

const jwt = require("jsonwebtoken");
const axios = require("axios");

const UserMiddleware = async (req, res, next) => {
  try {
    const ubertoken = req.cookies.ubertoken;
    if (!ubertoken) {
      return res.status(401).json({ error: "Access Denied" });
    }

    const data = jwt.verify(ubertoken, "helloimtoken");

    const response = await axios.get(`http://localhost:3001/user/profile`, {
      withCredentials: true

    })

    const user = response.data;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log("user",user)


    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

const CaptainMiddleware = async (req, res, next) => {
  try {
    const ubertoken = req.cookies.ubertoken;
    if (!ubertoken) {
      return res.status(401).json({ error: "Access Denied" });
    }

    const data = jwt.verify(ubertoken, "helloimtoken");

    const response = await axios.get(`http://localhost:3002/captain/profile`, {
      withCredentials: true

    })

    const user = response.data;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log("captain",user)


    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};
module.exports = {
  UserMiddleware,
  CaptainMiddleware
};

