import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import router from "./routes";
import { initRedis } from "./dbs/redis.init";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();

//init middlewares
// app.options('*', cors())
app.use(morgan("product")); // khi dev, combined khi deploy product
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//init db
require("./dbs/mongodb.init");
initRedis();

//init routes
app.use("/api/v1/", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// handle error
app.use((req, res, next) => {
  const error = new Error("Not found");
  next({ ...error, status: 404 });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error?.status || 500;
  return res.status(status).json({
    status: "error",
    code: status,
    stack: error.stack,
    message: error ?? "Internal Server Error",
  });
});

export default app;
