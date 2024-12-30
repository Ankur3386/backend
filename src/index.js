import { app } from './app.js';
import dotenv from 'dotenv'
import connectDB from './db/index.js';
dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at:${process.env.PORT}`)
    })
    app.on("error",(error)=>{
         console.log("ERR",error);
          throw error
                  })
})
.catch((err)=>{
    console.log("Mongodb connection failed",err);
    
})
// APPROACH 1(connection of database)
// const app =express()
// (
//     async()=>{
//         try{
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error",(error)=>{
//                 console.log("ERR",error);
//                 throw error
//             })
//             app.listen(process.env.PORT,()=>{
//                 console.log(`PORT is running on ${PORT}`)
//             })
//         }
//         catch(error){
//             console.error("ERROR:",error)
//             throw error
//         }
//     }
// )()