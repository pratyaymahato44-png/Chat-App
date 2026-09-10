import express from "express"
import cors from "cors"
import {clerkMiddleware} from "@clerk/express"
import fs from "fs"
import path from "path"
import clerkWebhook from "./webhooks/clerk.webhook.js" 
import { app } from "./lib/socket.js"


const publicDir = path.join(process.cwd(), "public")

// it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({type: "application/json"}), clerkWebhook)

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(clerkMiddleware())


// import routes 
import authRouter from "./routes/auth.route.js"
import messageRouter from "./routes/message.route.js"
 

// rotes declaration
app.use("/api/auth", authRouter)
app.use("/api/auth", messageRouter)


// if the public directory exists, serve the static files
// this is for the production build
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*any}", (_req,res,next) => {
        res.sendFile(path.join(publicDir, "index.html"), (error) => next(error))
    })
}

export default app