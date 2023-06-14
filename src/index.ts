import "express-async-errors"; // perfect
import "dotenv/config";

import app from "./app";

import connectToDb from "./utils/db";
const port = process.env.PORT || 3001;

connectToDb().then(() => {
	app.listen(port, () => {
		console.log(`app listening on port ${port}`);
	});
});
