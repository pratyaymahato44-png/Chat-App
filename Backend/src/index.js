import "dotenv/config"
import connectDB from "./db/index.js"
import app from "./app.js"

const PORT = process.env.PORT || 8000


connectDB()
.then( () => {
    app.listen(PORT, () => {
        console.log("server is running on PORT", PORT)
    })
})
.catch((error) => {
    console.error("MongoDB connection failed !!!", error)
})




