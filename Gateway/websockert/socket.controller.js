const axios = require("axios")
const rideModel = require("../../Ride/model/ride.model")
let roomUser = {}

const calculateDistanceandTime = async (origin, destination) => {
    try {
        const result = await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car', {
            locations: [
                [origin.lng, origin.lat],
                [destination.lng, destination.lat]
            ],

            metrics: ['distance', 'duration'],
            units: 'km'
        },
            {
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwYmE2ZjdiMzQ0ZDRlMGZhMjkzNzdjZjhjMzA1NDNjIiwiaCI6Im11cm11cjY0In0=',
                    'Content-Type': 'application/json'
                }
            }
        )
        return {
            distance: `${result.data.distances[0][1].toFixed(2)} km`,
            duration: `${Math.round(result.data.durations[0][1] / 60)} mins`
        }

    } catch (error) {
        console.error("error", error);
        throw error;
    }
}

const handleSocketConnection = (socket, io) => {
    console.log("A user connected:", socket.id);
    socket.on('joinRide', ({ rideId, role, destination }) => {


        // Join the new room
        socket.join(rideId);
        socket.rideId = rideId;
        socket.role = role;
        if (!roomUser[rideId]) roomUser[rideId] = {};
        // roomUser[rideId][role]={};
        if (destination) {
            roomUser[rideId].destination = destination;
        }
        console.log(`Joined ride ${rideId} as ${role}`);
    })
    socket.on('locationUpdate', async (data) => {
        const { lat, lng } = data

        const { rideId, role } = socket;
        if (!rideId) return;
        roomUser[rideId][role] = { lat, lng };
        // const users= roomUser[roomId]
        const { user, captain, destination } = roomUser[rideId];

        // save location to DB
        const update = role === "user" ? { userLocation: { lat, lng } } : { captainLocation: { lat, lng } };
        await rideModel.findByIdAndUpdate(rideId, update);

        // Calculate distance & ETA if both locations exist
        const ride = await rideModel.findById(rideId);

        let distance = null;
        let duration = null;

        try {
            // priority: captain → destination
            if (captain && destination) {
                const result = await calculateDistanceandTime(captain, destination);
                distance = result.distance;
                duration = result.duration;
            }
            // fallback: user → destination
            else if (user && destination) {
                const result = await calculateDistanceandTime(user, destination);
                distance = result.distance;
                duration = result.duration;
            }
        } catch (err) {
            distance = "N/A";
            duration = "N/A";
        }
        io.to(rideId).emit("liveTracking", {
            user,
            captain,
            destination,
            distance,
            duration
        });
    });
    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
        const { rideId, role } = socket;
        if (!rideId || !roomUser[rideId]) return;

        // Remove role from in-memory storage
        if (role && roomUser[rideId][role]) {
            delete roomUser[rideId][role];
        }


        // Broadcast offline event
        io.to(rideId).emit("user-offline", { role, rideUsers: roomUser[rideId] });

        // Clean up empty rooms (ignore destination key)
        const keys = Object.keys(roomUser[rideId]).filter(k => k === "user" || k === "captain");
        if (keys.length === 0) {
            delete roomUser[rideId];
            console.log("Deleted empty ride room:", rideId);
        }

    })

}

module.exports = { handleSocketConnection }

