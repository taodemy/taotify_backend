import { AuthRequest } from "./../types/index";
import { Request, Response, NextFunction } from "express";

import Order from "../models/order.model";
import { PRICE_OPTIONS } from "../constant/memberType";

export const addOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
	if (!req.user) {
		return res.status(403).json({ error: "no auth" });
	}
	const { product } = req.body;
	const { id: user_id } = req.user;
	// TODO: 判断一下product的类型，必须是三种之一。
	const price_id = PRICE_OPTIONS[product as keyof typeof PRICE_OPTIONS];
	const order = new Order({ user_id, product, price_id });

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
	await Order.findByIdAndDelete(order_id);
	res.status(204);
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
