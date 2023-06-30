import { AuthRequest } from "./../types/index";
import { Request, Response, NextFunction } from "express";

import Order from "../models/order.model";
import { PRICE_OPTIONS } from "../constant/memberType";

export const addOrder = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}

	const { id: price_id, product, unit_amount, currency, recurring } = req.body.price;
	const { id: user_id } = req.user;
	// TODO: 判断一下product的类型，必须是三种之一。
	// const price_id = PRICE_OPTIONS[product as keyof typeof PRICE_OPTIONS];

	const today = new Date();
	const formattedDate = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
	// TODO: 把这个随机数变成今天的第几单
	const randomDigits = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, "0");
	const order_number = `TAO${formattedDate}${randomDigits}`;
	const order = new Order({
		user_id,
		product: product.description,
		price_id,
		unit_amount,
		currency,
		order_number,
		interval: recurring.interval,
		interval_count: recurring.interval_count,
		expiresAt: Date.now() + 7 * 24 * 60 * 60000 // 60 minutes
	});

	// create payment session
	await order.save();

	res.status(201).json(order);
};

export const allOrder = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}
	const { id: user_id } = req.user;
	const orders = await Order.find({ user_id });

	res.status(200).json(orders);
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}
	const { order_id } = req.body;
	if (!order_id) {
		res.status(404).json({ error: "order not found" });
	}
	// await Order.findById(order_id).remove().exec();
	await Order.findByIdAndDelete(order_id);
	res.status(200).json({ message: "delete done" });
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}

	const { order_id, product } = req.body;
	const price_id = PRICE_OPTIONS[product as keyof typeof PRICE_OPTIONS];
	const order = await Order.findByIdAndUpdate(
		order_id,
		{
			product,
			price_id
		},
		{ new: true }
	);
	res.status(200).json(order);
};
