require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check
app.get("/", (req, res) => {
  res.send("Booking Service API is running");
});

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/bookings", bookingRoutes);

const adminBookingRoutes = require("./routes/adminBookingRoutes");
app.use("/admin/bookings", adminBookingRoutes);

// Swagger
const { swaggerUi, specs } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Start server
app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
  console.log(
    `Swagger docs: http://localhost:${PORT}/api-docs`
  );
});