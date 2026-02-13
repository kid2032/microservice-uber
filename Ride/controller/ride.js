const rideModel = require("../model/ride.model");
const { subscribeToQueue, publishToQueue } = require('../service/rabbit')

module.exports.CreateRide = async (req, res) => {
  try {
    const { pickup, destination } = req.body;


    const newRide = new rideModel({
      user: req._id,
      pickup,
      destination
    })



    await newRide.save();
    publishToQueue("new-ride", JSON.stringify(newRide))

    res.status(200).json({ "data": newRide })

  } catch (error) {
    res.status(500).send({ "error": error })

  }
}

module.exports.AcceptRide = async (req, res) => {
  try {
    const { rideId } = req.query;
    const ride = await rideModel.findById(rideId);
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }

    ride.status = 'accepted';
    await ride.save();
    publishToQueue("ride-accepted", JSON.stringify(ride))
    res.status(200).json({ data: ride });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

