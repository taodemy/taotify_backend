// This is your test secret API key.
import Stripe from "stripe";
import { Request, Response } from "express";

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = "whsec_cc16915d661233f985dba54876098d7480fc3751ab04079b76cbedc07756b803";

export const webhook = async (req: Request, res: Response) => {
	if (!process.env.STRIPE_PRIVATE_KEY) {
		return res.status(403).json({ error: "no auth" });
	}
	const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, { apiVersion: "2022-11-15" });

	let event = req.body;
	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
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
	const data = event.data.object;
	// console.log(data, "为了获取customer data");
	// Handle the event
	// const customer = await stripe.customers.retrieve(data.customer);
	// console.log(customer, "received 之后的customer");
	switch (event.type) {
		case "payment_intent.succeeded":
			// console.log(event.data.object.customer, "为了获取customer data 在switch里面");
			// const paymentIntent = event.data.object;
			console.log(`PaymentIntent for ${event.data.object.amount} was successful!`);
			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			// eslint-disable-next-line no-case-declarations
			const customer_data = await stripe.customers.retrieve(event.data.object.customer);
			console.log(customer_data, "@@@");
			break;

		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 res to acknowledge receipt of the event
	res.send().end();
};
