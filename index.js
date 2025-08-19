import { app } from "./app.js";
import connectDB from "./config/connectDB.js";
import connectRedis from "./config/redisClient.js";

const port = process.env.PORT || 4000;
const redis_port = process.env.REDIS_PORT;

connectDB()
.then(() => {
    return connectRedis(); // Wait for Redis connection
})
.then(() => {
    console.log(`Redis running on port: ${redis_port}`);
    // Start server only after both DB and Redis connected
    app.listen(port, () => {
        console.log(`Server running on port: ${port}\n`);
    });
})
.catch((error) => {
    console.error("Server Initialization failed:", error.message);
});