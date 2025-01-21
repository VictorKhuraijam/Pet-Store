import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const adminAuth = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request - Admin access required");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Verify if the decoded token matches admin credentials
        const adminSignature = process.env.ADMIN_EMAIL

        if (decodedToken.email !== process.env.ADMIN_EMAIL) {
            throw new ApiError(403, "Forbidden - Invalid admin credentials");
        }

        // Optionally store admin info in request for later use
        req.admin = {
            email: decodedToken.email,
            isAdmin: true
        };

        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid admin token");
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "Admin token has expired");
        }

        // If it's already an ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }

        // For any other errors
        throw new ApiError(500, "Internal server error during admin authentication");
    }
});

export default adminAuth;
