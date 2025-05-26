import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, folder = "images") => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: `news-app${folder}`,
    });
    fs.unlinkSync(localFilePath);
    return response.secure_url;
  } catch (error) {
    console.error("Upload failed:", error);
    try {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted.");
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError);
    }
    return null;
  }
};
