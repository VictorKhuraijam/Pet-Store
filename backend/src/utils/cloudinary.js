import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // file has been uploaded successfully
    //console.log("File is uploaded on cloudinary", response);
    fs.unlinkSync(localFilePath) // delete the file from storage
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload operation got failed
    return null
  }
}

//Deleting file using publicId
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(500,"Public ID is required for deletion from cloudinary");

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // Specify the type if required (e.g., "image", "video", etc.)
    });

    // Check if deletion was successful
    if (response.result === "ok" || response.result === "not found") {
      return response;
    } else {
      return null;
    }
  } catch (error) {
    throw new ApiError(500,"Error deleting file from Cloudinary")
  }
};


const deleteFromCloudinaryVideo = async (publicId) => {
  try {
    if (!publicId) throw new ApiError(500,"Public ID is required for deletion from cloudinary");

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video", // Specify the type if required (e.g., "image", "video", etc.)
    });

    // Check if deletion was successful
    if (response.result === "ok" || response.result === "not found") {
      return response;
    } else {
      return null;
    }
  } catch (error) {
    throw new ApiError(500,"Error deleting file from Cloudinary")
  }
};



export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  deleteFromCloudinaryVideo
}
