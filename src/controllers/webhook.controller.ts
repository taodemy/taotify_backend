// This is your test secret API key.
import Stripe from "stripe";
import { Request, Response } from "express";
import Order from "../models/order.model";
import User from "../models/user.models";
import { PRICE_OPTIONS } from "../constant/memberType";

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

export const webhook = async (req: Request, res: Response) => {
	if (!process.env.STRIPE_PRIVATE_KEY) {
		return res.status(403).json({ error: "no auth" });
	}
	const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

	let event = req.body;

	if (endpointSecret) {
		// Get the signature sent by Stripe
		const signature = req.headers["stripe-signature"];
		if (!signature) {
			return res.status(400).json({ error: "no signature" });
		}
		try {
			event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			console.log(`⚠️  Webhook signature verification failed.`, err.message);
			return res.sendStatus(400);
		}
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object;
			const subscription_id = session.subscription;
			// 4242 4242 4242 4242
			console.log(session, "@@@@ checkout.session.completed");
			//  metadata: { order_id: '64910bc4e92e81cb65ff4fbf' },
			const order_id = session.metadata.order_id as string;
			// console.log(session, "order id");
			const order = await Order.findByIdAndUpdate(
				order_id,
				{
					subscription_id: subscription_id,
					payment_status: "success"
				},
				{ new: true }
			);
			console.log(order, "@@@@ order");
			if (order) {
				const { price_id } = order;
				const member = PRICE_OPTIONS[price_id as keyof typeof PRICE_OPTIONS];
				// console.log(member, "@@member 容易读的版本");
				const user = await User.findByIdAndUpdate(
					order.user_id,
					{
						$addToSet: { orders: order._id },
						member_type: member
					},
					{ new: true }
				);
				// console.log(user, "@@user");
			}
			break;
		}
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 res to acknowledge receipt of the event
	res.send().end();
};
