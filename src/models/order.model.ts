import { Schema, model } from "mongoose";
import { PRICE_OPTIONS } from "../constant/memberType";

// Define the order schema
// interface IOrder extends Document {
// 	product: ProductOptions;
// 	// other fields
// }
const schema = new Schema(
	{
		user_id: {
			type: String,
			require: true
		},
		payment_status: {
			type: String,
			default: "pending"
		},
		product: {
			type: String
			// enum: Object.keys(PRICE_OPTIONS)
		},
		price_id: {
			type: String
			// enum: Object.values(PRICE_OPTIONS)
		},
		subscription_id: {
			type: String
		},
		unit_amount: {
			type: Number || String
		},
		currency: {
			type: String
		},
		interval: {
			type: String,
			enum: ["year", "month", "week", "trial"]
		},
		interval_count: {
			type: String || Number
		},
		order_number: {
			type: String
		},
		expiresAt: {
			type: Date,
			default: Date.now() + 60 * (60 * 1000),
			required: true
		}
	},
	{ timestamps: true }
);

const Order = model("orders", schema);

export default Order;
