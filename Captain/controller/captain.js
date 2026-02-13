const CaptainModel = require("../model/captain.model");
const Captain= require("../model/captain.model")
const bcrypt = require("bcryptjs")
const { subscribeToQueue } = require('../service/rabbit')
const pendingRequests = [];
module.exports.Register=async(req,res)=>{
    try {
        const {email,password}=req.body
        
        if (!email || !password) {
            
            return res.status(400).json({ error: "Email and password required" });
          }
        const alreadyEmail= await Captain.findOne({"email":email})
        if(alreadyEmail){
            res.status(400).json({"error":"Email already Exist"})
        }
        const Captain= new CaptainModel({
            email:email,
            password:password 
        })
        await Captain.save()
        res.status(200).json({"data":"Account Has been created"})


        
    } catch (error) {
      
        res.status(500).send({"error":error})

    }
}

module.exports.Login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const Captain = await Captain.findOne({ email });
      if (!Captain) {
        return res.status(400).json({ error: "Email doesn't exist" });
      }
  
      const isMatch = await bcrypt.compare(password, Captain.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Password incorrect" });
      }
  
      const token = await Captain.generateToken();
  
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
  
      await Captain.updateOne(
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
  
module.exports.Profile=async(req,res)=>{
    try {
        
        const id = req._id
        const Captain= await Captain.findById(id).select('-password -tokens').lean()
        if(!Captain){
            res.status(400).json({"error":"Account Doesnt exist "})
        }

        res.status(200).json({"data":Captain})
        
    } catch (error) {
        res.status(500).json({"error":error})

    }
}

module.exports.WaitForNewRide = async (req, res) => {
  // Set timeout for long polling (e.g., 30 seconds)
  req.setTimeout(30000, () => {
      res.status(204).end(); // No Content
  });

  // Add the response object to the pendingRequests array
  pendingRequests.push(res);
};

subscribeToQueue("new-ride", (data) => {
  const rideData = JSON.parse(data);

  // Send the new ride data to all pending requests
  pendingRequests.forEach(res => {
      res.json(rideData);
  });

  // Clear the pending requests
  pendingRequests.length = 0;
});