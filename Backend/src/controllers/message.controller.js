import { asyncHandler } from "../lib/asyncHandler.js"
import { User } from "../models/user.model.js"
import {ApiError} from "../lib/apiError.js"
import {ApiResponse} from "../lib/apiResponse.js"
import {Message} from "../models/message.model.js"
import {deleteChatMedia, hasImageKitConfig, uploadChatMedia} from  "../lib/imagekit.js"
import { getReceiverSocket, io } from "../lib/socket.js"

const getUserForSidebar = asyncHandler(async(req, res) => {
    try {
        const loggedInUserId = req.user._id

        if(!loggedInUserId){
            throw new ApiError(404, "User is not logged In")
        }

        const filterUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-clerkId")

        res
        .status(200)
        .json(
            new ApiResponse(200, filterUsers, "Users filtered successfully")
        )

    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error")
    }
})

const getConversationForSidebar = asyncHandler(async(req,res) => {
    try {
        const loggedInUserId = req.user._id

        if(!loggedInUserId){
            throw new ApiError(404, "User not logged In")
        }

        const conversations = await Message.aggregate([

            // 1. Keep only the messages I sent or received.
            {
                $match: {
                    $or: [
                        {senderId: loggedInUserId},
                        {recieverId: loggedInUserId}
                    ]
                }
            },
            // 2. Collapse them into one row per chat partner, noting our latest message time.
            {
                $group: {
                    _id: {
                        $cond: [
                            {$eq: ["$senderId", loggedInUserId]},

                            "$recieverId",
                            "$senderId"
                        ]
                    },
                    lastMessageAt: { $max: "$createdAt" }
                }
            },
            // 3. Put the most recent conversation at the top.
            {
                $sort: { lastMessageAt: -1}
            },
            // 4. Look up each partner's user profile (comes back as an array).
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            // 5. Pull that profile out of the array and make it the document.
            {
                $replaceRoot: {
                    newRoot: { $first : "$user"}
                }
            },
            // 6.  Hide the private clerkId field from the result.
            {
                $project: { clerkId : 0 }
            }
        ])

        res
        .status(200)
        .json(
            new ApiResponse(200, conversations, "Sidebar conversation is fetched Succesfully")
        )
        
    } catch (error) {
        throw new ApiError(500, error.message || "User Conversation fialed to fetch")
    }
})

const getMessages = asyncHandler(async(req, res) => {
   try {
     const { id: userToChatId } = req.params
     const myId = req.user._id
 
     const messages = await Message.find({
         $or: [
             {senderId: myId, recieverId: userToChatId},
             {senderId: userToChatId, recieverId: myId}
         ]
     }).sort({createdAt: 1})
 
     res
     .status(200)
     .json(
         new ApiResponse(200, messages, "User message feched successfully")
     )
   } catch (error) {
        throw new ApiError(500, error.message || "Interval server error")
   }
    
})

const sendMessage = asyncHandler(async(req, res) => {
    try {
        const { text } = req.body
        const { id: recieverId }= req.params
        const senderId = req.user._id

        let videoUrl
        let imageUrl
        let videoFileId
        let imageFileId

        if(req.file){
            if(!hasImageKitConfig()){
                throw new ApiError(500, "Media upload is not configured")
            }

            const uploadedMedia = await uploadChatMedia(req.file)
            if(req.file.mimetype.startsWith("video/")){
                videoUrl = uploadedMedia.url
                videoFileId = uploadedMedia.fileId
            }  
            else {
                imageUrl = uploadedMedia.url
                imageFileId = uploadedMedia.fileId
            }        
        }

        const newMessage = new Message({
            senderId: senderId,
            recieverId,
            text,
            image: imageUrl,
            video: videoUrl,
            imageFileId,
            videoFileId
        })

        await newMessage.save()

        const receiverSocketId = getReceiverSocket(recieverId)

        if(receiverSocketId){
            // Only send the message in real time if user is online
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res
        .status(201)
        .json(
            new ApiResponse(201, newMessage, "Message has sent successfully")
        )
    } catch (error) {
        throw  new ApiError(500, error.message || "Internal server Error")
    }
})

const deleteMessage = asyncHandler(async(req, res) => {
    try {
        const {id: messageId } = req.params
        const loggedInUserId = req.user._id

        const message = await Message.findById(messageId)

        if(!message){
            throw new ApiError(401, "Message not found")
        }

        if(message.senderId.toString() !== loggedInUserId.toString()){
            throw new ApiError(403, "You can delete your own message")
        }

        if(message.imageFileId){
            await deleteChatMedia(message.imageFileId)
        }

        if(message.videoFileId){
            await deleteChatMedia(message.videoFileId)
        }

        await Message.findByIdAndDelete(messageId)

        const receiverSocketId = getReceiverSocket(message.recieverId.toString())

        if(receiverSocketId){
            io.to(receiverSocketId).emit("messageDeleted", messageId)
        }

        res
        .status(200)
        .json(
            new ApiResponse(200, { messageId }, "Message deleted Successfully")
        )

    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete Message")
    }
})

export {
    getUserForSidebar,
    getConversationForSidebar,
    getMessages,
    sendMessage,
    deleteMessage
}