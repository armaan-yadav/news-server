import jwt from "jsonwebtoken";

class AuthMiddleware {
  async auth(req, res, next) {
    console.log("auth middleware");

    const { authorization } = req.headers;

    if (authorization) {
      const token = authorization.split("Bearer ")[1];

      if (token) {
        try {
          const userInfo = await jwt.verify(token, process.env.secret);
          req.userInfo = userInfo;
          next();
        } catch (error) {
          console.log(error);
          return res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
}

const authMiddleware = new AuthMiddleware();

export default authMiddleware;
