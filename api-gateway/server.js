import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import gatewayRoutes from "./routes/api.route.js";
// import { errorHandler } from "./middleware/errorHandler.js";

console.log("EVENT_URL:", process.env.EVENT_URL);

const app = express();
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());

// Gateway routes
app.use("/", gatewayRoutes);

// // Centralized error handler
// app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`\n📡 Registered upstream services:`);
  console.log(`   /events   → ${process.env.EVENT_URL}`);
  console.log(`   /users    → ${process.env.USER_URL}`);
  console.log(`   /bookings → ${process.env.BOOKING_URL}`);
  console.log(`   /reviews  → ${process.env.REVIEW_URL}`);
  console.log(`\n✅ Ready to proxy requests\n`);
});
