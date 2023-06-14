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
	const { id, email } = req.user;
	// 支付月度会员费
	if (!process.env.STRIPE_PRIVATE_KEY) {
		return res.status(400).json({ error: "no stripe private key" });
	}
	const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });
	// stripe.customers.retrieve
	const customer = await stripe.customers.create({
		email,
		metadata: { id, memberType: "monthly" }
	});
	// console.log(customer, "@@@@ customer");
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "payment",
		customer: customer.id,
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
		// TODO: 需要构建dynamic前端页面
		success_url: `${process.env.FRONTEND_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}.html`,
		cancel_url: `${process.env.FRONTEND_URL}/cancel.html`
	});
	res.status(222).json({ url: session.url });
};
