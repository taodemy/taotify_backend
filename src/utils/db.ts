import { connection, set, connect } from "mongoose";

const connectToDb = () => {
	// need a import "dotenv/config" before use it in TS
	const connectionString = process.env.CONNECTION_STRING;
	if (!connectionString) {
		console.error("connection string is not defined");
		process.exit(1);
	}
	const db = connection;
	db.on("connected", () => {
		// logger.info
		console.log(`connected ${connectionString}`);
	});
	db.on("error", (error) => {
		console.error(error);
		process.exit(2);
	});
	db.on("disconnected", () => {
		console.error("db disconnected");
	});
	//   const db = mongoose.connection;
	set("strictQuery", false);
	return connect(connectionString);
};
export default connectToDb;
