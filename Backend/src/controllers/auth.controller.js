import { asyncHandler } from "../lib/asyncHandler";
import { ApiError } from "../lib/apiError";
import { ApiResponse } from "../lib/apiResponse";


export const checkAuth = asyncHandler(async(req, res) => {
    const user = req.user

    if(!user){
        throw new ApiError(401, "Unauthorized access")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, user, "User is verified")
    )
})