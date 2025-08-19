import { nanoid } from 'nanoid';
import Url from '../models/urls.model.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/ApiError.js';
import { ApiResponse } from '../utilities/ApiResponse.js';
import { redisClient } from '../config/redisClient.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/v1/url/resolve`;

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

    // Check cache
    const cachedUrl = await redisClient.get(shortUrl);
    if (cachedUrl) {
        console.log("Fetched from cache");

        // Asynchronous click count update
        process.nextTick(async () => {
            try {
                await Url.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
            } catch (err) {
                console.error("Failed to update click count:", err.message);
            }
        });
        
        return res.redirect(cachedUrl);
    }
    // Cache miss
    const url = await Url.findOne({ shortUrl });
    if (!url) {
        throw new ApiError(404, "Shortened URL not found");
    }

    url.clicks += 1;
    await url.save();
    // Cache the result
    await redisClient.setEx(shortUrl, 3600, url.longUrl);

    return res.redirect(url.longUrl);
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