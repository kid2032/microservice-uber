import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { completeRide } from "../api/api";

export default function RideTracking() {
  const { rideId } = useParams();
  const [user, setUser] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const socket = io("http://localhost:3000", {
    auth: { token: localStorage.getItem("ubertoken") },
  });

  useEffect(() => {
    navigator.geolocation.watchPosition(pos => {
      socket.emit("locationUpdate", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    }, null, { enableHighAccuracy: true });

    socket.emit("joinRide", { rideId, role: "user" });

    socket.on("liveTracking", data => {
      setUser(data.user);
      setCaptain(data.captain);
      setDestination(data.destination);
      setDistance(data.distance);
      setDuration(data.duration);
    });

    return () => socket.disconnect();
  }, []);

  const handleComplete = async () => {
    await completeRide(rideId);
    alert("Ride completed!");
  };

  const center = user || { lat: 28.6, lng: 77.2 };

  return (
    <div>
      <h3>Live Tracking</h3>
      <div>Distance: {distance} | ETA: {duration}</div>
      <button onClick={handleComplete}>Complete Ride</button>

      <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: "80vh" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {user && <Marker position={[user.lat, user.lng]} />}
        {captain && <Marker position={[captain.lat, captain.lng]} />}
        {destination && <Marker position={[destination.lat, destination.lng]} />}
      </MapContainer>
    </div>
  );
}
