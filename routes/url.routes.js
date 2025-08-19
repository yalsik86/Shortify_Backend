import { Router } from "express";
import { shortenURL, resolveURL, getAnalytics } from "../controllers/url.controllers.js";
import { rateLimiter } from "../middlewares/rateLimit.js";

const urlRouter = Router();

urlRouter.route("/shorten").post(rateLimiter, shortenURL);
urlRouter.route("/resolve/:shortUrl").get(rateLimiter, resolveURL);
urlRouter.route("/analytics/:shortUrl").get(getAnalytics);

export default urlRouter;