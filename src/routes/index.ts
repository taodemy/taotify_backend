import users from "./users.route";
import member from "./member.route";
import { Request, Response, Router } from "express";
import authGuard from "../middleware/authGuard";


const v1Router = Router();

v1Router.get("/", (req: Request, res: Response) => {
	res.status(200).json({ status: "@v1Router working" });
});
v1Router.use("/users", users);
v1Router.use("/membership", authGuard, member);

export default v1Router;
