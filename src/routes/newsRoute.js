import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import newsControllers from "../controllers/newsController.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// dashboard
router.post("/api/news/add", authMiddleware.auth, newsControllers.add_news);
router.put(
  "/api/news/update/:news_id",
  authMiddleware.auth,
  newsControllers.update_news
);
router.put(
  "/api/news/status-update/:news_id",
  authMiddleware.auth,
  newsControllers.update_news_update
);
router.get("/api/images", authMiddleware.auth, newsControllers.get_images);

router.post(
  "/api/images/add",
  authMiddleware.auth,
  upload.single("file"),
  newsControllers.add_image
);

router.get(
  "/api/news",
  authMiddleware.auth,
  newsControllers.get_dashboard_news
);
router.get(
  "/api/news/:news_id",
  authMiddleware.auth,
  newsControllers.get_dashboard_single_news
);

// website
router.get("/api/all/news", newsControllers.get_all_news);
router.get("/api/popular/news", newsControllers.get_popular_news);
router.get("/api/latest/news", newsControllers.get_latest_news);
router.get("/api/images/news", newsControllers.get_images);
router.get("/api/recent/news", newsControllers.get_recent_news);
router.get("/api/news/details/:slug", newsControllers.get_news);
router.get("/api/category/all", newsControllers.get_categories);
router.get("/api/category/news/:category", newsControllers.get_category_news);
router.get("/api/search/news", newsControllers.news_search);

// common
router.get("/api/category/all-name", newsControllers.getAllCategoryNames);

export default router;
