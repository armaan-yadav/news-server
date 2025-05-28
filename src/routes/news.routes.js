import { Router } from "express";
import categoriesControllers from "../controllers/categories.controllers.js";
import imageControllers from "../controllers/image.controllers.js";
import newsControllers from "../controllers/news.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";

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
  imageControllers.add_image
);
router.post(
  "/api/images/jodit/add",
  authMiddleware.auth,
  upload.single("files[0]"),
  imageControllers.add_image_jodit
);

router.get(
  "/api/news",
  authMiddleware.auth,
  newsControllers.get_paginated_news
);
router.get("/stats", authMiddleware.auth, newsControllers.get_news_stats);

router.get(
  "/api/news/:news_id",
  authMiddleware.auth,
  newsControllers.get_dashboard_single_news
);
router.delete(
  "/api/news/delete/:news_id",
  authMiddleware.auth,
  newsControllers.delete_news
);

router.post(
  "/api/category/add",
  authMiddleware.auth,
  categoriesControllers.add_category
);
router.delete(
  "/api/category/delete/:categoryId",
  authMiddleware.auth,
  categoriesControllers.delete_category
);

// website
router.get("/api/all/news", newsControllers.get_all_news);
router.get("/api/popular/news", newsControllers.get_popular_news);
router.get("/api/latest/news", newsControllers.get_latest_news);
router.get("/api/images/news", newsControllers.get_images);
router.get("/api/recent/news", newsControllers.get_recent_news);
router.get("/api/news/details/:slug", newsControllers.get_news);
router.get(
  "/api/category/all-stats",
  categoriesControllers.get_categories_with_stats
);
router.get("/api/category/news/:category", newsControllers.get_category_news);
router.get("/api/search/news", newsControllers.news_search);

// common
router.get("/api/category/all-name", categoriesControllers.getAllCategoryNames);

export default router;
