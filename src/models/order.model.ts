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
			type: String,
			enum: Object.keys(PRICE_OPTIONS)
		},
		price_id: {
			type: String,
			enum: Object.values(PRICE_OPTIONS)
		},
		subscription_id: {
			type: String
		}
	},
	{ timestamps: true }
);

const Order = model("orders", schema);

export default Order;
