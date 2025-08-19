// import { createClient } from 'redis';
// import dotenv from 'dotenv';

// dotenv.config();

// const redisClient = createClient({
//     url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
// });

// redisClient.on('error', (err) => {
//     console.error('Redis error:', err.message);
// });

// redisClient.on('connect', () => {
//     console.log('Redis client connected.');
// });

// const connectRedis = async () => {
//     try {
//         await redisClient.connect();
//         console.log('Redis connection established successfully.');
//     } catch (connectionError) {
//         console.error('Redis connection failed:', connectionError.message);
//         process.exit(1); // Exit the process if Redis connection fails
//     }
// };

// export { redisClient };
// export default connectRedis;

import { Redis } from '@upstash/redis'

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const connectRedis = async () => {
  try {
    await redisClient.set('health-check', 'ok')
    console.log('Upstash Redis connection established successfully.')
  } catch (err) {
    console.error('Upstash Redis connection failed:', err.message)
    process.exit(1)
  }
}

export { redisClient }
export default connectRedis