import { hash, compare } from "bcrypt";

export const hashPassword = async (password: string) => {
	return await hash(password, 12);
};

export const validatePassword = (password: string, savedPassword: string) => {
	return compare(password, savedPassword);
};
