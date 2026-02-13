const mongoose =require("mongoose")

mongoose.set('strictQuery',false)
mongoose.connect('mongodb://localhost:27017/uber-user',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000, 
})
.then(()=>console.log("Connection successfully..."))
.catch((err)=> console.log(err));
