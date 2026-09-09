import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getConversationForSidebar, getMessages, getUserForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/users").get(protectRoute, getUserForSidebar)
router.route("/conversations").get(protectRoute, getConversationForSidebar)
router.route("/:id").get(protectRoute, getMessages)
router.route("/send/:id").post(protectRoute, sendMessage)



export default router