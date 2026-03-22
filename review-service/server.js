require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(bodyParser.json());

// app.get("/", (req, res) => {
//   res.send("Review Service API is running");
// });

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});
