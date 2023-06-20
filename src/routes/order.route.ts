import { addOrder, allOrder, deleteOrder, updateOrder } from "../controllers/order.controller";
import { Router } from "express";

const orderRouter = Router();

orderRouter.get("", (req, res) => {
	res.status(200).json({ data: "hello from order router" });
});
orderRouter.post("/add", addOrder);
orderRouter.get("/all", allOrder);
orderRouter.patch("/update", updateOrder);
orderRouter.delete("/delete", deleteOrder);

export default orderRouter;
