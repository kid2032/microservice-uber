const axios=require("axios")
let roomUser = {}

const calculateDistanceandTime=async(origin,destination)=>{
    try {
        const result= await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car',{
            locations: [
                [origin.lng, origin.lat],
                [destination.lng, destination.lat]
              ],
              
            metrics:['distance','duration'],
            units:'km'
        },
       { headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMwYmE2ZjdiMzQ0ZDRlMGZhMjkzNzdjZjhjMzA1NDNjIiwiaCI6Im11cm11cjY0In0=',
            'Content-Type': 'application/json'
        }}
    )
    return{
        distance :`${result.data.distances[0][1].toFixed(2)} km`,
        duration :`${Math.round(result.data.durations[0][1]/60)} mins`
    }
        
    } catch (error) {
        console.error("error",error);
        throw error;
    }
}

const handleSocketConnection = (socket, io) => {
    console.log("A user connected:", socket.id);
    socket.on('joinRoom', (roomId) => {
       

        // Join the new room
        socket.join(roomId);
        socket.roomId=roomId;
        if(!roomUser[roomId]) roomUser[roomId]={};
        roomUser[roomId][socket.id]={};
    })
    socket.on('locationUpdate', async(data) => {
       const {lat,lng}=data

       roomId=socket.roomId;
       if(!roomId) return;
        roomUser[roomId][socket.id]={lat,lng};
        const users= roomUser[roomId]
        const updateUser=await Promise.all(
            Object.keys(users).map(async (id)=>{
                let distance=null,duration=null;
                try {
                    if(id !==socket.id){
                        const result=await calculateDistanceandTime(users[id],users[socket.id])
                        distance=result.distance;
                        duration=result.duration;
                    }
                    
                } catch (error) {
                    distance='N/A';
                    duration='N/A';
                }
                return{
                    userId:id,
                    lat:users[id].lat,
                    lng:users[id].lng,
                    distance,
                    duration
                }
            })
        )
        io.to(roomId).emit('locationUpdate',updateUser);
    });
    socket.on('disconnect',()=>{
        console.log("User disconnected:", socket.id);
        const roomId= socket.roomId;
        if(roomId && roomUser[roomId]){
            delete roomUser[roomId][socket.id];
            io.to(roomId).emit('user-offline',Object.keys(roomUser[roomId]).map(id=>({
                userId:id,
                ...roomUser[roomId][id]
            })));
            if(Object.keys(roomUser[roomId]).length ===0){
                delete roomUser[roomId];
            }
        }
    
      })

}

