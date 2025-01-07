import mongoose,{Schema} from "mongoose"
const subscriptionSchema =new Schema({
    subscriber:{ //the peerson who is subscribing
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{//one we are subscribing to
        type: Schema.Types.ObjectId,
        ref:"User"
    },

},{timestamps:true})
export const Subscription =mongoose.model("Subscription",subscriptionSchema)