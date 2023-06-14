import express from "express";
import { webhook } from "./controllers/stripe.controller.js";
import errorMiddleware from "./middleware/errorMiddleware/index.js";
import v1Router from "./routes";

const app = express();

// body parser json/application
app.use("/v1/stripe/webhook", express.raw({ type: "application/json" }), webhook);

app.use(express.json());
app.use("/v1", v1Router);
errorMiddleware(app);

export default app;
