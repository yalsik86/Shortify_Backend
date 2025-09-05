import { nanoid } from 'nanoid';
import Url from '../models/urls.model.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
import { redisClient } from '../config/redisClient.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `https://shortify-backend-donb.onrender.com/api/v1/url/resolve`;

export const shortenURL = asyncHandler(async (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
        throw new ApiError(400, "Enter URL before proceeding");
    }

    const existingUrl = await Url.findOne({ longUrl });
    if (existingUrl) {
        return res.status(409).json(
            new ApiResponse(
                409,
                {
                    shortUrl: `${BASE_URL}/${existingUrl.shortUrl}`,
                    longUrl: longUrl,
                },
                "URL already shortened"
            )
        );
    }

    const shortUrl = nanoid(8);
    const url = new Url({ shortUrl, longUrl });
    await url.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                shortUrl: `${BASE_URL}/${shortUrl}`,
                longUrl: longUrl,
            },
            "URL shortened successfully"
        )
    );
});

export const resolveURL = asyncHandler(async (req, res) => {
    const { shortUrl } = req.params;
    console.log("Resolving shortUrl:", shortUrl);

    try {
        // Check cache
        const cachedUrl = await redisClient.get(shortUrl);
        console.log("Cache result:", cachedUrl);

        if (cachedUrl) {
            console.log("Fetched from cache, redirecting to:", cachedUrl);

            // Asynchronous click count update
            process.nextTick(async () => {
                try {
                    await Url.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
                    console.log("Click count updated in background for:", shortUrl);
                } catch (err) {
                    console.error("Failed to update click count:", err.message);
                }
            });

            return res.redirect(cachedUrl);
        }

        // Cache miss
        console.log("Cache miss for:", shortUrl);
        const url = await Url.findOne({ shortUrl });
        console.log("DB result:", url);

        if (!url) {
            console.warn("Short URL not found:", shortUrl);
            throw new ApiError(404, "Shortened URL not found");
        }

        url.clicks += 1;
        await url.save();
        console.log("Click count incremented for:", shortUrl);

        // Cache the result
        try {
            await redisClient.set(shortUrl, url.longUrl, { ex: 3600 })
            console.log("Cached in Redis:", url.longUrl);
        } catch (err) {
            console.error("Failed to cache in Redis:", err.message);
        }

        console.log("Redirecting to:", url.longUrl);
        return res.redirect(url.longUrl);

    } catch (err) {
        console.error("Resolve error:", err.message, err.stack);
        throw new ApiError(500, "Internal server error while resolving URL");
    }
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });

    if (!url) {
        throw new ApiError(404, "Short URL not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, { shortUrl: url.shortUrl, longUrl: url.longUrl, clicks: url.clicks }, "URL analytics retrieved successfully.")
    );
});