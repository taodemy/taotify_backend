import { verifyToken } from "../utils/jwt";
import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

// check if token in header matches
export default (req: AuthRequest, res: Response, next: NextFunction) => {
	const authorization = req.header("authorization");
	if (!authorization) {
		res.status(401).json({ error: "missing bearer token" });
		return;
	}
	const tokenArray = authorization.split(" ");
	if (tokenArray.length !== 2 || tokenArray[0] !== "Bearer") {
		res.status(401).json({ error: "invalid bearer token format" });
		return;
	}
	const decode = verifyToken(tokenArray[1]);
	req.user = decode;
	next();
};
