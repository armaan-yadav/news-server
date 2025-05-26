import { Router } from "express";
import newsControllers from "../controllers/news.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";
import categoriesControllers from "../controllers/categories.controllers.js";

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
router.get("/api/category/all", categoriesControllers.get_categories);
router.get("/api/category/news/:category", newsControllers.get_category_news);
router.get("/api/search/news", newsControllers.news_search);

// common
router.get("/api/category/all-name", categoriesControllers.getAllCategoryNames);

export default router;
