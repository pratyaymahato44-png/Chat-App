import "dotenv/config"
import connectDB from "./db/index.js"
import app from "./app.js"
import job from "./lib/cronJob.js"

const PORT = process.env.PORT || 8000


app.get("/health", (req, res) => {
    res.status(200).json({ok: true})
})


connectDB()
.then( () => {
    app.listen(PORT, () => {
        console.log("server is running on PORT", PORT)
    })

    if(process.env.NODE_ENV === "production"){
        job.start()
    }
})
.catch((error) => {
    console.error("MongoDB connection failed !!!", error)
})




