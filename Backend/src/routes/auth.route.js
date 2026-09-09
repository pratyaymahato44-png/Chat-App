import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { checkAuth } from "../controllers/auth.controller.js";

const router = Router()


router.route("/check").get(protectRoute, checkAuth)


export default router