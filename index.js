import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser"
import mongoose from "mongoose";
import router from "./router/index.js";
import errorMiddleware from './middlewares/error-middleware.js'

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: true
}))
app.use('/api', router)
app.use(errorMiddleware) //обработка ошибок мидлварина должна последней идти в цепочке всех мидлварин

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log(`Server up and running on ${PORT} port`))
    } catch(e) {
        console.log(e)
    }
}

start()
