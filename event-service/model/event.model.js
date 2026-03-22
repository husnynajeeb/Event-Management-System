import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["VIP", "Regular", "Balcony", "Economy"],
    },
    price: { type: Number, required: true },

    row: { type: Number, required: true },
    column: { type: Number, required: true },
    seatNumber: { type: String, required: true }, // "A-10"

    bookingStatus: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    reservedUntil: { type: Date },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingTime: { type: Date },

    features: [{ type: String }],
  },
  { _id: false },
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    start: { type: Date, required: true },
    end: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.start || value > this.start;
        },
        message: "End date must be after start date.",
      },
    },

    location: String,

    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },

    tags: [String],

    // For seat-map events:
    isSeated: { type: Boolean, default: true },
    seats: [SeatSchema],

    coverImage: String,
    galleryImages: [String],
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", EventSchema);
export default Event;
