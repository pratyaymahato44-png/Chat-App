import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { checkAuth } from "../controllers/auth.controller";

const router = Router()


router.route("/check").get(protectRoute, checkAuth)


export default router