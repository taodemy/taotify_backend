import { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
	user?: { [key: string]: string } | JwtPayload;
}
// error handler type
export type ErrorRequestHandler = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;
