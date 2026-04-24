const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Create a new review   
router.post("/", reviewController.createReview);

// Get all reviews for a particular event
router.get("/:eventId", reviewController.getAllReviewsByEvent);
router.get("/", reviewController.getAllReviews);

// Get all reviews by a particular user
router.get("/user/:userId", reviewController.getAllReviewsByUser);

// Update a review by review_id
router.put("/:id", reviewController.updateReview);

// Delete a review by review_id
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
