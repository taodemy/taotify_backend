import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export default (req: AuthRequest, res: Response, next: NextFunction) => {
	// 看看req中是不是有user
	if (!req.user) {
		res.status(401).json({ error: "login required" });
		return;
	}
	if (req.user.role === "admin") {
		next();
		return;
	}
	res.status(403).json({
		error: "permission deny,contact your system admin (code: 4003)"
	});
	next();
};
