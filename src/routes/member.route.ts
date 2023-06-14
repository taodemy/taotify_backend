import { Router } from "express";
import { trial } from "../controllers/membership.controller";

const memberRouter = Router();

memberRouter.use("", trial);

export default memberRouter;
