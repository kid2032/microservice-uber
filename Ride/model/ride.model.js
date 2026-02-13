const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  captain: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // pickup: {
  //   type: String,
  //   required: true
  // },
  // destination: {
  //   type: String,
  //   required: true
  // },
  
  pickup: { lat: Number, lng: Number },
  destination: { lat: Number, lng: Number },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'started', 'completed'],
    default: 'requested'
  },
}, {
  timestamps: true
})


module.exports = mongoose.model('Ride', rideSchema);
