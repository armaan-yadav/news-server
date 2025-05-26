import { Router } from "express";
import authControllers from "../controllers/authControllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

router.post("/api/login", authControllers.login);
router.post("/api/signup", authControllers.signup);
router.post(
  "/api/news/writer/add",
  authMiddleware.auth,
  roleMiddleware.role,
  authControllers.add_writer
);
router.get(
  "/api/news/writers",
  authMiddleware.auth,
  roleMiddleware.role,
  authControllers.get_writers
);

export default router;
