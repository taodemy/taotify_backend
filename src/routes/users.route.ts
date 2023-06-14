import { Router } from "express";
import {
	register,
	login,
	activateUser,
	forgotPassword,
	resetPassword,
	changePassword
} from "../controllers/users.controller";
import authGuard from "../middleware/authGuard";

const userRouter = Router();

userRouter.get("", (req, res) => {
	res.status(200).json({ data: "hello from user router" });
});
userRouter.post("/register", register);
userRouter.get("/activate/:activateToken", activateUser);
userRouter.post("/login", login);
userRouter.patch("/change-password", authGuard, changePassword);
userRouter.post("/forgot-password", forgotPassword);
userRouter.put("/reset-password/:resetToken", resetPassword);

export default userRouter;
