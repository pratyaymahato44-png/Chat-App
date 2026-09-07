import express from "express"
import cors from "cors"
import {clerkMiddleware} from "@clerk/express"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json())
app.use(clerkMiddleware())

export default app