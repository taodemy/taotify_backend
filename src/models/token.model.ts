import { Schema, model } from "mongoose";

const schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "user"
		},
		token: {
			type: String,
			required: true
		},
		isUsed: {
			type: Boolean,
			default: false
		},
		expiresAt: {
			type: Date,
			required: true
		}
	},
	{
		timestamps: true
	}
);

const Token = model("tokens", schema);
export default Token;
