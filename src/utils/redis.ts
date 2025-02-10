import {createClient} from "redis"
import axios from "axios"
import express, { NextFunction, Request, Response } from "express"

const app = express()
const PORT = 8080

const redisClient = createClient({
    url: "redis://localhost:8081"
})
redisClient.connect().catch(console.error)

app.get('/post', async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {

        const redisData = await redisClient.get('post')
        if(redisData){
            res.status(200).send(JSON.parse(redisData))
            return 
        }
        
        const get = await axios.get('https://jsonplaceholder.typicode.com/posts')
        await redisClient.setEx('post', 5, JSON.stringify(get.data))
        res.status(200).send(get.data)
        
    } catch (error) {
        next(error)
    }
})


app.listen(PORT, ()=> {
    console.log(`Server running in port ${PORT}`)
})