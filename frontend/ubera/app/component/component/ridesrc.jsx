import { useState, useEffect } from "react";
import { requestRide } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function RideSearch() {
  const [pickup, setPickup] = useState({ lat: "", lng: "" });
  const [destination, setDestination] = useState({ lat: "", lng: "" });
  const navigate = useNavigate();

  const handleRequestRide = async () => {
    try {
      const res = await requestRide(pickup, destination);
      const rideId = res.data.rideId;
      navigate(`/tracking/${rideId}`);
    } catch (err) {
      alert(err.response?.data?.error || "Ride request failed");
    }
  };

  return (
    <div>
      <h2>Request Ride</h2>
      <input placeholder="Pickup Lat" onChange={e => setPickup({...pickup, lat: +e.target.value})} />
      <input placeholder="Pickup Lng" onChange={e => setPickup({...pickup, lng: +e.target.value})} />
      <input placeholder="Destination Lat" onChange={e => setDestination({...destination, lat: +e.target.value})} />
      <input placeholder="Destination Lng" onChange={e => setDestination({...destination, lng: +e.target.value})} />
      <button onClick={handleRequestRide}>Request Ride</button>
    </div>
  );
}
