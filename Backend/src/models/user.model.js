import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        
    },
    profilePicture: {
        type: String,
        default: ""
    }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema)