class RoleMiddleware {
  role(req, res, next) {
    console.log("role middleware");
    const { userInfo } = req;
    if (userInfo && userInfo.role === "admin") {
      next();
    } else {
      return res.status(401).json({ message: "unable to access this api" });
    }
  }
}

const roleMiddleware = new RoleMiddleware();

export default roleMiddleware;
