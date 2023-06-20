import users from "./users.route";
import { Request, Response, Router } from "express";
import authGuard from "../middleware/authGuard";
import stripeRouter from "./stripe.route";
import orderRouter from "./order.route";

const v1Router = Router();

v1Router.get("/", (req: Request, res: Response) => {
	res.status(200).json({ status: "@v1Router working" });
});
v1Router.use("/users", users);
v1Router.use("/stripe", authGuard, stripeRouter);
v1Router.use("/orders", authGuard, orderRouter);

export default v1Router;
