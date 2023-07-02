import { AuthRequest } from "../types";
import Stripe from "stripe";
import { Router } from "express";

let stripe: Stripe;
if (process.env.STRIPE_PRIVATE_KEY)
	stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

// 这些是stripe管理的数据库，所以这个server没有相关数据库。
const stripeRouter = Router();

stripeRouter.get("/price", async (req: AuthRequest, res) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}
	const prices = await stripe.prices.list({
		type: "recurring",
		active: true,
		currency: "aud",
		expand: ["data.product"]
	});
	res.status(200).json({
		prices: prices.data
	});
});

stripeRouter.post("/test", async (req: AuthRequest, res) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth " });
	}
	const { order } = req.body;
	res.status(210).json(order);
});

stripeRouter.post("/create-subscription", async (req: AuthRequest, res) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}
	// price 可以从req.body来。
	// const { priceId } = req.body;
	// const { id } = req.user;
	// const customerId = req.cookies["customer"];

	// create order，order是一个桥梁，在付款前保存打本地数据库。付款后更新数据库。
	// console.log(priceId, "@@priceId");
	// const order = new Order({
	// 	user_id: id,
	// 	customer_id: customerId,
	// 	price_id: priceId
	// });

	// create payment session
	// await order.save();
	const { order } = req.body;

	const { _id, price_id } = order;
	// console.log(_id, price_id, "@@@ subscription");
	// 点击checkout的时候，会看到order这个object
	if (!_id || !price_id) {
		return res.status(404).json({ error: "no valid order data" });
	}
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "subscription",
		// customer: customerId,
		metadata: {
			order_id: _id.toString()
		},
		line_items: [{ price: price_id, quantity: 1 }],
		success_url: `${process.env.FRONTEND_URL}/member/cart`,
		cancel_url: `${process.env.FRONTEND_URL}/cancel`
	});
	console.log(session.id, "check session id and subscription_id, see any difference ");
	res.status(201).json({ url: session.url, session: session });
});

stripeRouter.post("/cancel-subscription", async (req, res) => {
	// Cancel the subscription
	try {
		const deletedSubscription = await stripe.subscriptions.del(req.body.subscriptionId);

		res.send({ subscription: deletedSubscription });
	} catch (error) {
		return res.status(400).json(error);
	}
});

stripeRouter.post("/update-subscription", async (req, res) => {
	// update subscription 只要拿到price id就可以。
	try {
		const subscription = await stripe.subscriptions.retrieve(req.body.subscriptionId);
		const updatedSubscription = await stripe.subscriptions.update(req.body.subscriptionId, {
			items: [
				{
					id: subscription.items.data[0].id,
					price: process.env[req.body.newPriceLookupKey.toUpperCase()]
				}
			]
		});

		res.send({ subscription: updatedSubscription });
	} catch (error) {
		return res.status(400).send({ error: error });
	}
});

stripeRouter.get("/subscriptions", async (req, res) => {
	// Simulate authenticated user. In practice this will be the
	// Stripe Customer ID related to the authenticated user.
	const customerId = req.cookies["customer"];

	const subscriptions = await stripe.subscriptions.list({
		customer: customerId,
		status: "all",
		expand: ["data.default_payment_method"]
	});

	res.json({ subscriptions });
});

export default stripeRouter;
