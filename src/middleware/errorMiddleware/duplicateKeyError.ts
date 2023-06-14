import { Request, Response, NextFunction } from "express";

const duplicateKeyError = (error: Error, req: Request, res: Response, next: NextFunction) => {
	if (error.name === "MongoServerError") {
		res.status(409).send({ error: error.message });
		return;
	}
	next(error);
};
export default duplicateKeyError;
