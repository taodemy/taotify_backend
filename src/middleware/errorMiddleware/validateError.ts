import { NextFunction, Request, Response } from "express";
const validateError = (error: Error, req: Request, res: Response, next: NextFunction) => {
	if (error.name === "ValidationError") {
		res.status(404).json({ error: error.message });
	}
	next(error);
};

export default validateError;
