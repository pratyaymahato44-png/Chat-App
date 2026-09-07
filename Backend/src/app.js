import express from "express"
import cors from "cors"
import {clerkMiddleware} from "@clerk/express"
import fs from "fs"
import path from "path"

const app = express()

const publicDir = path.join(process.cwd(), "public")

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json())
app.use(clerkMiddleware())


// if the public directory exists, serve the static files
// this is for the production build
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*any}", (_req,res,next) => {
        res.sendFile(path.join(publicDir, "index.html"), (error) => next(error))
    })
}

export default app