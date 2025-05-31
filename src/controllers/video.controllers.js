import ytVideoModel from "../models/yt.video.models.js";

class VideoController {
  get_yt_videos = async (req, res) => {
    try {
      const videos = await ytVideoModel.find();
      return res.status(200).json({ videos: videos });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error retrieving videos", error });
    }
  };
}

const VideoControllers = new VideoController();

export default VideoControllers;
