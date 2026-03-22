const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    email: { type: String, required: true },
    event_id: { type: String, required: true },
    event_name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

// Virtual for review_id
reviewSchema.virtual("review_id").get(function () {
  return this._id.toString();
});

reviewSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.review_id = ret._id;
    // Keep _id for frontend usage
    return ret;
  },
});

module.exports = mongoose.model("Review", reviewSchema);
