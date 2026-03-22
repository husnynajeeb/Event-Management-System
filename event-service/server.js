import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import eventRouter from "./routes/event.route.js";
import { swaggerUi, specs } from "./config/swagger.js";

//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();

//middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Diagnostic middleware for multipart requests
app.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/events/create") {
    console.log("Request received:");
    console.log("Content-Type:", req.get("content-type"));
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
  }
  next();
});

//api endpoints
app.use("/events", eventRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
  res.send("Api working ");
});

app.listen(port, () => {
  console.log("Server Started", port);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
