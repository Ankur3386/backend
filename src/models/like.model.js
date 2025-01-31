import mongoose from 'mongoose'
const  likeSchema = new mongoose.Schema(
    {
    likedby:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:mongoose.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:mongoose.Types.ObjectId,
        ref:"Comment"
    },
    
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
    
    },{
        timestamps:true
    }
) 
export const Like = mongoose.model("Like",likeSchema)