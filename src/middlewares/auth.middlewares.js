import jwt from "jsonwebtoken";

class AuthMiddleware {
  async auth(req, res, next) {
    console.log("auth middleware called");
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const token = authorization.split(" ")[1];
    

    try {
      const userInfo = jwt.verify(token, process.env.secret);

      if (!userInfo?.isActive) {
        return res
          .status(403)
          .json({ message: "Access denied - Inactive account" });
      }

      req.userInfo = userInfo;
      next();
    } catch (error) {
      console.error("JWT error:", error);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
  }
}

export default new AuthMiddleware();
