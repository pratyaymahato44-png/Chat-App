import { getAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ApiError } from "../lib/apiError.js";


export const protectRoute = asyncHandler(async (req, res, next) => {
    try {
        const {userId} = getAuth()

        if(!userId){
            throw new ApiError(401, "Unauthorize access")
        }

        const user = await User.findOne({clerkId: userId})

        if(!user){
            throw new ApiError(404, "User profile is not synced yet")
        }

        req.user = user

        next()

    } catch (error) {
        throw new ApiError(500, error?.message || "Internal server error")
    }
})