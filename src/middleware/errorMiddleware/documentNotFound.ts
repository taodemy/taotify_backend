import { Request, Response, NextFunction } from "express";

import DocumentNotFound from "../../errors/DocumentNotFound";

const documentNotFoundHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
	if (error instanceof DocumentNotFound) {
		res.status(404).send({ error: error.message });
		return;
	}
	next(error);
};
export default documentNotFoundHandler;
