import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

export default function RideTracking() {
  const { rideId } = useParams();
  const [captain, setCaptain] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const socket = io("http://localhost:3000");

  // calculate route via ORS
  const fetchRoute = async (start, end) => {
    try {
      const res = await axios.post("http://localhost:3000/user/route", {
        start,
        end
      });
      const coords = res.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      setRoute(coords);
    } catch (err) {
      console.error("Error fetching route:", err);
    }
  };

  useEffect(() => {
    // Join ride room as user
    socket.emit("joinRide", { rideId, role: "user" });

    // Listen to live captain updates
    socket.on("liveTracking", data => {
      setCaptain(data.captain);
      setDestination(data.destination);
      setDistance(data.distance);
      setDuration(data.duration);

      // fetch route from captain → destination
      if (data.captain && data.destination) {
        fetchRoute(data.captain, data.destination);
      }
    });

    return () => socket.disconnect();
  }, []);

  const center = captain || destination || { lat: 28.6, lng: 77.2 };

  return (
    <div>
      <h3>Ride Tracking</h3>
      <div>Distance: {distance || "-"} | ETA: {duration || "-"}</div>

      <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: "80vh" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {destination && <Marker position={[destination.lat, destination.lng]} />}
        {captain && <Marker position={[captain.lat, captain.lng]} />}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
}
