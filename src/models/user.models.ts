import { Schema, model } from "mongoose";

const schema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minLength: [8, "Password must be up to 8 characters"]
			//   maxLength: [23, "Password must not be more than 23 characters"],
		},
		email: {
			type: String,
			required: [true, "Please add a email"],
			unique: true,
			trim: true,
			match: [
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				"Please enter a valid emaial"
			]
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		orders: [
			{
				type: Schema.Types.ObjectId,
				ref: "Order"
			}
		],
		member_type: {
			type: String,
			enum: ["trial", "monthly", "quarterly", "yearly"],
			default: "trial"
		}
	},
	{
		timestamps: true
	}
);

const User = model("users", schema);
export default User;
