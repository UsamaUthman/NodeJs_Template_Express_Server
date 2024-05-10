import { notFoundErrorMiddleware } from "./middlewares/not-found-error-middleware.js";
import { globalErrorHandlerMiddleware } from "./middlewares/global-error-handler-middleware.js";
import NotFoundError from "./utils/types-errors/not-found.js";
import initializeRoutes from "./routes/index.js";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import compression from "compression";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import hpp from "hpp";
import fs from "fs";

async function init() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    /* Check if .env file exists */
    const isENVFileExists = fs.existsSync(__dirname + "/.env");

    if (!isENVFileExists) {
      throw new NotFoundError(".env file not found");
    }

    /* Load environment variables */
    dotenv.config({ path: "./.env" });

    /* Connect to database */
    await connectDB();

    /* Create express app */
    const app = express();

    /* Middlewares */
    app.use(compression({ level: 6 }));
    app.use(cors());
    app.use(
      express.json({
        limit: "100kb",
      })
    );
    app.use(express.urlencoded({ extended: false }));
    app.use(helmet());
    app.use(hpp());
    // Limit request from the same API
    const limiter = rateLimit({
      max: 150,
      windowMs: 60 * 60 * 1000,
      message: "Too Many Request from this IP, please try again in an hour",
    });
    app.use("/api", limiter);

    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    }

    /* Routes */
    app.get("/api", (req, res) => {
      res.send("Hello World");
    });

    initializeRoutes(app);

    /* Not found error handling middleware */
    app.use("*", notFoundErrorMiddleware);

    /* Global Error handling middleware */
    app.use(globalErrorHandlerMiddleware);

    /* Start server */
    const serverListen = app.listen(process.env.PORT, () => {
      console.log(`🚀 Server listening on port ${process.env.PORT}`);
    });

    /* Handling rejection outside express */
    process.on("unhandledRejection", (error) => {
      throw error;
    });

    /* Handling exception */
    const uncaughtException = (error) => {
      serverListen.close(() => {
        console.error(
          `The server was shut down due to uncaught exception: ${error.message}`
        );
        process.exit(1);
      });
    };

    process.on("uncaughtException", uncaughtException);

    /* Handle process termination signals */
    const shutdown = () => {
      serverListen.close(() => {
        console.log("The server is shutting down...");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error(`An error occurred during startup: ${error.message}`);
    process.exit(1);
  }
}

init();
