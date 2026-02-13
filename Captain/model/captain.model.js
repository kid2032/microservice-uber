const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const CaptainSchema = new Schema({
   
      email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error('Invalid Email');
          }
        }
      },
      password: {
        type: String,
        required: true
      },
     
      role: {
        type: String,
        default: "captain"
      },
      isAvailable: {
        type: boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      tokens: [{
        token: {
          type: String,
          required: true
        }
      }]
    
})


CaptainSchema.methods.generateToken = async function (){
  try {
    const token = jwt.sign({
        _id:this._id.toString(),
        email:this.email.toString(),
        role:this.role.toString(),

    },
    "helloimtoken",
    {"expiresIn":"5d"}
    )
    this.tokens= this.tokens.concat({token})
    await this.save()
    return token
  } catch (error) {
    console.error("Error while generating token:", error)
  }
}

CaptainSchema.pre("save",async function (next){
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      next();
})
module.exports= mongoose.model("Captain",CaptainSchema)

