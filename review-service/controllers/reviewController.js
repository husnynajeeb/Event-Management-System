const Review = require("../models/reviewModel");
const { validateUser } = require("../utils/userServiceClient");
const { getEventById } = require("../utils/eventServiceClient"); // // Create a new review
// exports.createReview = async (req, res) => {
//   try {
//     const review = new Review(req.body);
//     await review.save();
//     res.status(201).json(review);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// Create a new review
exports.createReview = async (req, res) => {
  try {
    // 1. Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // extract "Bearer <token>"

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // 2. Validate the token and get user details from User Service
    const user = await validateUser(token);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid token or user not found." });
    }

    // 3. Construct the user_name from firstName and lastName (handling nulls)
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Anonymous User";

    // 4. Fetch event details from event-service
    const event = await getEventById(req.body.event_id);
    if (!event || !event.title) {
      return res
        .status(400)
        .json({ error: "Invalid event_id or event not found." });
    }

    // 5. Create the review object with user and event details populated automatically
    const reviewData = {
      ...req.body,
      event_name: event.title, // use 'title' from event-service as event_name
      user_id: user.id,
      user_name: userName,
      email: user.email,
    };

    const review = new Review(reviewData);
    await review.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// Get all reviews for a particular event
exports.getAllReviewsByEvent = async (req, res) => {
  try {
    const reviews = await Review.find({ event_id: req.params.eventId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews by a particular user
exports.getAllReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a review by ID
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a review by ID - USER CAN DELETE OWN, ADMIN CAN DELETE ANY
exports.deleteReview = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // Validate the token and get user details
    const user = await validateUser(token);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid token or user not found." });
    }

    console.log("Deleting review ID:", req.params.id, "by user:", user.id);

    // Get the review first
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user is the owner OR is an admin
    const isOwner = review.user_id === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "Forbidden. Only review owners or admins can delete reviews.",
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(req.params.id);

    console.log("Review deleted successfully");
    res.json({
      message: "Review deleted successfully",
      success: true,
      deletedBy: isAdmin ? "ADMIN" : "OWNER",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
