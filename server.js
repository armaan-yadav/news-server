import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import NodeCache from "node-cache";
import authRoutes from "./src/routes/auth.routes.js";
import newsRoutes from "./src/routes/news.routes.js";
import db_connect from "./src/utils/db.js";
import videoRouter from "./src/routes/video.routes.js";

dotenv.config();

const app = express();

export const nodeCache = new NodeCache();

app.use(bodyParser.json());
app.use(morgan("dev"));

if (process.env.mode === "production") {
  app.use(cors());
} else {
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ],
    })
  );
}

function logTime(req, res, next) {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  console.log(
    `⏰ [${hours} : ${minutes} : ${seconds}] ${req.method} ${req.originalUrl}`
  );
  next();
}
app.use("/", authRoutes);
app.use("/", logTime, newsRoutes);
app.use("/", logTime, videoRouter);

app.get("/", (req, res) => res.send("Hello World!"));

const port = process.env.port || 3000;

db_connect();

app.listen(port, () => console.log(`Server is running on port ${port}!`));
