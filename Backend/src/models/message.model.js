import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recieverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,       
    },
    image: {
        type: String
    },
    video: {
        type: String
    },
    imageFileId: {
        type: String
    },
    videoFileId: {
        type: String
    }
}, {timestamps: true})

export const Message = mongoose.model("Message", messageSchema)