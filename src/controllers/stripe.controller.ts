import Stripe from "stripe";
import { Request, Response } from "express";

const storeItems = new Map([
	[1, { priceInCents: 10000, name: "Learn React Today" }],
	[2, { priceInCents: 20000, name: "Learn CSS Today" }]
]);

const abc = async (req: Request, res: Response) => {
	if (!process.env.STRIPE_PRIVATE_KEY) {
		return res.status(400).json({ error: "no stripe private key" });
	}
	const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: req.body.items.map((item: any) => {
				const storeItem = storeItems.get(item.id);
				return {
					price_data: {
						currency: "usd",
						product_data: {
							name: storeItem?.name
						},
						unit_amount: storeItem?.priceInCents
					},
					quantity: item.quantity
				};
			}),
			success_url: `${process.env.CLIENT_URL}/success.html`,
			cancel_url: `${process.env.CLIENT_URL}/cancel.html`
		});
		res.json({ url: session.url });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
export default abc;
