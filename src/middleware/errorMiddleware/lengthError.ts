import { Request, Response, NextFunction } from "express";

const lengthErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
	if (error.name === "CastError") {
		res.status(404).send(`${error}`);
		return;
	}
	next(error);
};

export default lengthErrorHandler;
