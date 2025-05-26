import { uploadOnCloudinary } from "../utils/cloudinary.js";

class ImageControllers {
  add_image = async (req, res) => {
    console.log("add image called");
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("starting upload");
      const url = await uploadOnCloudinary(file.path, "thumbnails");
      console.log("uploaded");

      if (!url) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
      return res
        .status(201)
        .json({ message: "Image uploaded successfully", url });
    } catch (error) {
      console.error("add_image error", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  add_image_jodit = async (req, res) => {
    console.log("add image called");
    try {
      const file = req.file;
      console.log(req.file);

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("first");
      const url = await uploadOnCloudinary(file.path, "news-description");
      console.log("second");
      if (!url) {
        return res.status(500).json({ message: "Failed to upload image" });
      }
      return res.json({
        files: [url],
      });
    } catch (error) {
      console.error("add_image error", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

const imageControllers = new ImageControllers();
export default imageControllers;
