import mongoose, { model, Schema } from "mongoose";

const schema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "user"
	},
	member_Type: {
		type: String,
		enum: ["trial", "monthly", "quarterly", "yearly"],
		default: "trial"
	},
	createdAt: { type: Date, default: Date.now }
});

const Member = model("members", schema);

export default Member;
