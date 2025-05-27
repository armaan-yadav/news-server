import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import NodeCache from "node-cache";
import authRoutes from "./src/routes/auth.routes.js";
import newsRoute from "./src/routes/news.routes.js";
import db_connect from "./src/utils/db.js";

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
      origin: ["http://localhost:5173", "http://localhost:3000"],
    })
  );
}

app.use("/", authRoutes);
app.use("/", newsRoute);

app.get("/", (req, res) => res.send("Hello World!"));

const port = process.env.port || 3000;

db_connect();

app.listen(port, () => console.log(`Server is running on port ${port}!`));
