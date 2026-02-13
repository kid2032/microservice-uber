const userModel = require("../model/user.model");
const User= require("../model/user.model")
const bcrypt = require("bcryptjs")
const axios = require("axios")
const { subscribeToQueue } = require('../service/rabbit')
const EventEmitter = require('events');
const rideEventEmitter = new EventEmitter();
module.exports.Register=async(req,res)=>{
    try {
        const {email,password}=req.body
        
        if (!email || !password) {
            
            return res.status(400).json({ error: "Email and password required" });
          }
        const alreadyEmail= await User.findOne({"email":email})
        if(alreadyEmail){
            res.status(400).json({"error":"Email already Exist"})
        }
        const user= new userModel({
            email:email,
            password:password 
        })
        await user.save()
        res.status(200).json({"data":"Account Has been created"})


        
    } catch (error) {
        console.log("dsas",error)
        res.status(500).send({"error":error})

    }
}

module.exports.Login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Email doesn't exist" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Password incorrect" });
      }
  
      const token = await user.generateToken();
  
      res.cookie("ubertoken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });
  
      res.status(200).json({ data: "Login successful" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports.Logout = async (req, res) => {
    try {
      const ubertoken = req.cookies.ubertoken;
  
      await User.updateOne(
        { _id: req._id },
        { $pull: { tokens: { token: ubertoken } } }
      );
  
      res.clearCookie("ubertoken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
  
      res.status(200).json({ data: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  module.exports.CheckAuthorization = async (req, res) => {
    try {
      req._id = data._id;
      req.email = data.email;
      req.role = data.role;
  
      if(!(req._id && req.email) ){
        res.status(403).json({ error: "Unauthorized Acess. Please Login " });
        return
      }
  
      res.status(200).json({ data: {"_id":req._id,"role":req.role,"email":req.email} });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports.Profile=async(req,res)=>{
    try {
        
        const id = req._id
        const user= await User.findById(id).select('-password -tokens').lean()
        if(!user){
            res.status(400).json({"error":"Account Doesnt exist "})
        }

        res.status(200).json({"data":user})
        
    } catch (error) {
        res.status(500).json({"error":error})

    }
}

module.exports.AcceptedRide = async (req, res) => {
  // Long polling: wait for 'ride-accepted' event
  rideEventEmitter.once('ride-accepted', (data) => {
      res.send(data);
  });

  // Set timeout for long polling (e.g., 30 seconds)
  setTimeout(() => {
      res.status(204).send();
  }, 30000);
}

subscribeToQueue('ride-accepted', async (msg) => {
  const data = JSON.parse(msg);
  rideEventEmitter.emit('ride-accepted', data);
});



// Get route (polyline) between two points using ORS
module.exports.getRoute = async (req, res) => {
  const { start, end } = req.body; // { lat, lng }
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  try {
      const response = await axios.post(
          url,
          {
              coordinates: [
                  [start.lng, start.lat],
                  [end.lng, end.lat]
              ]
          },
          {
              headers: {
                  Authorization: '=',
                  'Content-Type': 'application/json',
              },
          }
      );
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching route', error: error.response?.data || error.message });
  }
};


// Update user location
module.exports.updateLocation = async (req, res) => {
  const { userId, lat, lng } = req.body;

  try {
      const user = await User.findByIdAndUpdate(userId, { lat, lng }, { new: true });
      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ message: 'Error updating location', error });
  }
};