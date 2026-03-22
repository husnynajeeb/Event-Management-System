import express from "express";
import { proxyToService } from "../controller/proxy.controller.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "api-gateway" });
});

// Do NOT strip prefix for /events
router.use("/events", (req, res) =>
  proxyToService(req, res, process.env.EVENT_URL),
);

router.use("/auth", (req, res) =>
  proxyToService(req, res, process.env.USER_URL),
);

router.use("/users", (req, res) =>
  proxyToService(req, res, process.env.USER_URL),
);
router.use("/bookings", (req, res) =>
  proxyToService(req, res, process.env.BOOKING_URL),
);
router.use("/reviews", (req, res) =>
  proxyToService(req, res, process.env.REVIEW_URL),
);

export default router;
