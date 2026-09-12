import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { deleteMessage, getConversationForSidebar, getMessages, getUserForSidebar, sendMessage } from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/users").get(protectRoute, getUserForSidebar)
router.route("/conversations").get(protectRoute, getConversationForSidebar)
router.route("/:id").get(protectRoute, getMessages)
router.route("/send/:id").post(protectRoute, upload.single("media"), sendMessage)
router.route("/:id").delete(protectRoute, deleteMessage)



export default router