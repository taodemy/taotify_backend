import { verifyToken } from "./../utils/jwt";
import { Request, Response } from "express";
import crypto from "crypto";
import UserModel from "../models/user.models";
import { hashPassword, validatePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import sendEmail from "../utils/email";
import TokenModel from "../models/token.model";
import { AuthRequest } from "../types";

export const register = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).json({ error: "missing required info" });
		return;
	}
	const userFromDb = await UserModel.findOne({ $or: [{ email }] });
	if (userFromDb) {
		return res.status(400).json({ error: "username or email existed" });
	}
	const hashedPassword = await hashPassword(password);
	// console.log(hashedPassword);
	const user = new UserModel({ email, password: hashedPassword, username: email });

	/*============================*/
	// generate Active Token in db
	/*============================*/

	// Delete token if it exists in DB
	const token = await TokenModel.findOne({ userId: user._id });
	if (token) {
		await token.deleteOne();
	}

	const activateToken = crypto.randomBytes(32).toString("hex") + user._id;
	// console.log(activateToken, "@@activate token");
	const hashedToken = crypto.createHash("sha256").update(activateToken).digest("hex");

	// Save Token to DB
	await new TokenModel({
		userId: user._id,
		email: user.email,
		token: hashedToken,
		expiresAt: Date.now() + 60 * (60 * 1000)
	}).save();
	/*============================*/
	// nodemailer
	/*============================*/
	const { BACKEND_URL, API_VERSION } = process.env;
	// this url is a backend url with GET method, a single click will trigger it.
	const activateUrl = `${BACKEND_URL}/${API_VERSION}/users/activate/${activateToken}`;

	const message = `
	<h2>Hi ${user.username || user.email}. Welcome to Taotify.</h2>
	<h4>we offer the cutting-edge music meets your passion for discovery. We are thrilled to have you join our vibrant community of music enthusiasts.<h4>
	<hr>
	<p>Almost there... Please click the link below to activate your account</p>  
	
	<a href=${activateUrl} clicktracking=off>activate account</a>
	
	<p>if the link does not work, please copy the link <u>${activateUrl}</u> and paste in the browser to activate your account.</p>
	<p>This link will expire in 48 hours and can only be used once.</p>

	<p>from Taotify team</p>
   `;
	const subject = "Welcome message from Taotify";
	const send_to = user.email;
	const send_from = process.env.SENDER;
	const emailProps = {
		subject,
		message,
		send_to,
		send_from
	};
	try {
		await sendEmail(emailProps);
	} catch (error) {
		// console.log(error, "@@@@@@====@@@@@");
		res.status(500);
		throw new Error("Email not sent, please try again");
	}

	await user.save();
	res.status(201).json({ user: user._id });
};

/*============================*/
// active user
/*============================*/
export const activateUser = async (req: Request, res: Response) => {
	const { activateToken } = req.params;

	// Hash token, then compare to Token in DB
	const hashedToken = crypto.createHash("sha256").update(activateToken).digest("hex");

	// Find Token in DB
	const userToken = await TokenModel.findOne({
		token: hashedToken,
		expiresAt: { $gt: Date.now() }
	});
	// console.log(userToken, "@@@userToken");
	if (!userToken) {
		res.status(404);
		throw new Error("Invalid or Expired Token");
	}
	if (userToken.isUsed) {
		res.status(400);
		throw new Error("Token has been used or invalid");
	}
	const user = await UserModel.findOne({ _id: userToken.userId });
	if (!user) {
		return res.status(404).json({
			message: "user is not found, please register"
		});
	}
	user.isVerified = true;
	userToken.isUsed = true;
	await userToken.save();
	await user.save();

	await UserModel.findOneAndUpdate({ isUsed: true });
	res.status(200).json({
		message: "user activated, Please Login"
	});
};

/*============================*/
// login user
/*============================*/
export const login = async (req: Request, res: Response) => {
	type LoginProps = {
		email?: string;
		username?: string;
		password: string;
	};
	const { email, password }: LoginProps = req.body;
	if (!email || !password) {
		return res.status(401).json({ error: "missing email or password." });
	}
	const user = await UserModel.findOne({ email });
	if (!user) {
		return res.status(404).json({ error: `no email:${email} matches database` });
	}
	if (!user.isVerified) {
		return res.status(400).json({
			error: `your account ${email} is not activated,please check your activation email.`
		});
	}
	if (!user.password) {
		return res.status(400).json({
			error: `something wrong with your account ${email},Error code 4003`
		});
	}
	const isPassCorrect = await validatePassword(password, user.password);
	if (!isPassCorrect) {
		return res.status(401).json({ error: `invalid password` });
	}
	const token = generateToken({ id: user._id, role: "user", email: user.email });
	// send token to frontend to save the token in local storage.
	// modify axios/fetch request header to contain the token in Authorization.
	res.status(201).json({ user: user._id, token });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		res.status(403);
		throw new Error("no permission to access");
	}

	const user = await UserModel.findById(req.user._id);
	const { oldPassword, password } = req.body;

	if (!user) {
		res.status(400);
		throw new Error("User not found, please signup");
	}
	//Validate
	if (!oldPassword || !password) {
		res.status(400);
		throw new Error("Please add old and new password");
	}

	if (!user.password) {
		res.status(400);
		throw new Error("something wrong with your account ${email},Error code 4003");
	}

	// check if old password matches password in DB
	const passwordIsCorrect = await validatePassword(oldPassword, user.password);

	// Save new password
	if (!passwordIsCorrect) {
		res.status(400);
		throw new Error("Old password is incorrect");
	}
	user.password = password as string;
	await user.save();
	res.status(203).send("Password change successful");
};

/*============================*/
// forgot password
/*============================*/
export const forgetPassword = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}
	const { email } = req.body;
	const user = await UserModel.findOne({ email });

	if (!user) {
		res.status(404);
		throw new Error("User does not exist");
	}

	// Delete token if it exists in DB
	const token = await TokenModel.findOne({ email: user.email });
	if (token) {
		await token.deleteOne();
	}

	// Create Reset Token
	const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
	// console.log(resetToken);

	// Hash token before saving to DB
	const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	// Save Token to DB
	await new TokenModel({
		userId: user._id,
		token: hashedToken,
		expiresAt: Date.now() + 30 * 60000 // 30 minutes
	}).save();

	// Construct Reset Url
	// this reset url will be built from taotify frontend, and use the resetToken as a dynamic route
	// with a reset button, the new password and this resetToken will be send to backend,
	// and the info will be processed in reset-password route handler
	const resetUrl = `${process.env.FRONTEND_URL}/password/${resetToken}`;

	// Reset Email pattern
	const message = `
		<h2>Hello ${user.username}</h2>
		<hr>
		<p>Please use the url below to reset your password</p>  
		<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		<br>
		<p>This reset link is valid for only 30minutes.</p>
		<p>Regards</p>
		<p>Taotify Team</p>
	  `;
	const subject = "Password Reset Request";
	const send_to = user.email;
	const sent_from = process.env.EMAIL_USER;
	const emailProps = {
		subject,
		message,
		send_to,
		sent_from
	};
	try {
		await sendEmail(emailProps);
		res.status(200).json({ success: true, message: "activation Email Sent" });
	} catch (error) {
		res.status(500);
		throw new Error("Email not sent, please try again");
	}
};

/*============================*/
// reset password
/*============================*/

export const resetPassword = async (req: Request, res: Response) => {
	const { password } = req.body;
	const { resetToken } = req.params;

	// Hash token, then compare to Token in DB
	const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	// fIND tOKEN in DB
	const userToken = await TokenModel.findOne({
		token: hashedToken,
		expiresAt: { $gt: Date.now() }
	});

	if (!userToken) {
		res.status(404);
		throw new Error("Invalid or Expired Token");
	}

	// Find user
	const user = await UserModel.findOne({ _id: userToken.userId });
	if (!user) {
		res.status(404);
		throw new Error("No user found");
	}
	user.password = password;
	await user.save();
	res.status(200).json({
		message: "Password Reset Successful, Please Login"
	});
};

// login status

export const loginStatus = (req: AuthRequest, res: Response) => {
	// 检查看看登陆状态
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}
	const { token } = req.user;
	// const verified = verifyToken(token)

	const decode = verifyToken(token);
	!decode && res.status(403).json({ isLogin: false });
	res.status(200).json({ isLogin: true });
};
