import { AuthRequest } from "../types";
import authGuard from "../middleware/authGuard";
import Stripe from "stripe";
import { Router } from "express";

let stripe: Stripe;
if (process.env.STRIPE_PRIVATE_KEY)
	stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

const stripeRouter = Router();

stripeRouter.get("/price", async (req: AuthRequest, res) => {
	// TODO: Hard code cart, which is not a big issue
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

// 选择好月度会员，年度会员的时候调用这个api并且跳转到stripe payment 页面
// 用webhook 监听paymentIntent.status === 'succeeded' 的时候，跳回我的success 页面。同时更新我的数据库，把会员数据更新。
// 为了处理退出会员，我需要记录这次购买的数据。需要：subscriptionId，

// 这是在cart 页面里，我可以看到目前购物车里有什么东西。
// 也就是cart 会在req.body中。
stripeRouter.post("/checkout", async (req: AuthRequest, res) => {
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
	const { _id, priceId } = JSON.parse(order);
	// 点击checkout的时候，会看到order这个object

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: "subscription",
		// customer: customerId,
		metadata: {
			order_id: _id.toString()
		},
		line_items: [{ price: priceId, quantity: 1 }],
		// TODO: 需要构建dynamic前端页面
		success_url: `${process.env.FRONTEND_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}.html`,
		cancel_url: `${process.env.FRONTEND_URL}/cancel.html`
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
