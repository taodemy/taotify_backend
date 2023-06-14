import documentNotFound from "./documentNotFound";
import lengthError from "./lengthError";
import validateError from "./validateError";
import duplicateKeyError from "./duplicateKeyError";
import { Express } from "express";
import { ErrorRequestHandler } from "../../types";
const defaultHandler: ErrorRequestHandler = (error, req, res) => {
	console.log(error, "@@@@@@ error handler");
	res
		.status(500)
		.send(
			`${
				process.env.ENVIRONMENT === "production"
					? "something went wrong, please try again later"
					: error.name + " : " + error.message + " @ default error handler"
			}`
		);
};

const errorMiddleware = (app: Express) => {
	app.use(validateError);
	app.use(lengthError);
	app.use(documentNotFound);
	app.use(duplicateKeyError);
	app.use(defaultHandler);
};

export default errorMiddleware;
