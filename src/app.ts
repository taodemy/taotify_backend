import express from "express";
import errorMiddleware from "./middleware/errorMiddleware/index.js";
import v1Router from "./routes";

const app = express();

// body parser json/application
app.use(express.json());
app.use("/v1", v1Router);
errorMiddleware(app);

export default app;

