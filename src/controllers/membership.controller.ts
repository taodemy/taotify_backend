import { AuthRequest } from "../types/index";
import { Request, Response } from "express";
import MemberModel from "../models/membership.model";
import Stripe from "stripe";

export const trial = (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}

	res.status(200).json({ msg: "testing 123" });
};

export const monthly = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}
	// 支付月度会员费
	if (!process.env.STRIPE_PRIVATE_KEY) {
		return res.status(400).json({ error: "no stripe private key" });
	}
	const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "payment",
		line_items: [
			{
				price_data: {
					currency: "aud",
					product_data: {
						name: "monthly member fee"
					},
					unit_amount: 500
				},
				quantity: 1
			}
		],
		success_url: `${process.env.FRONTEND_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}.html`,
		cancel_url: `${process.env.FRONTEND_URL}/cancel.html`
	});
	res.status(222).json({ url: session.url });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	// res.status(200).json({ msg: "tesing" });
};
