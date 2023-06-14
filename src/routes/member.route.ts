import { Router } from "express";
import { monthly, trial } from "../controllers/membership.controller";

const memberRouter = Router();

memberRouter.patch("/", trial);
memberRouter.patch("/monthly", monthly);

export default memberRouter;
