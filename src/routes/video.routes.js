import { Router } from "express";
import VideoControllers from "../controllers/video.controllers.js";

const videoRouter = new Router();

videoRouter.get("/api/videos/yt-videos", VideoControllers.get_yt_videos);

export default videoRouter;
