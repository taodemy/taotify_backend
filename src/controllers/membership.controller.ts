import { AuthRequest } from "../types/index";
import { Request, Response } from "express";
import MemberModel from "../models/membership.model";

export const trial = (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}

	res.status(200).json({ msg: "tesing" });
};
