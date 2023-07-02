import { JwtPayload } from "jsonwebtoken";

import jwt from "jsonwebtoken";
if (!process.env.JWT_KEY) {
	throw new Error("missing jwt secrete in configuration");
}
const JWT_KEY = process.env.JWT_KEY as string;

export const generateToken = (payload: string | object) => {
	return jwt.sign(payload, JWT_KEY, { expiresIn: "8h" });
};

export const verifyToken = (token: string) => {
	return jwt.verify(token, JWT_KEY) as JwtPayload;
};
