import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis client connected.');
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis connection established successfully.');
    } catch (connectionError) {
        console.error('Redis connection failed:', connectionError.message);
        process.exit(1); // Exit the process if Redis connection fails
    }
};

export { redisClient };
export default connectRedis;