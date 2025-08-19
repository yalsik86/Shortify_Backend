import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per window
    message: { status: 429, error: "Too many requests, please try again in a few moment." },
    standardHeaders: true,
    legacyHeaders: false, 
});