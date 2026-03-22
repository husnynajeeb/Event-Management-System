const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  event_id: { type: String, required: true },
  event_name: { type: String, required: true },
  seat_number: { type: String },
  ticket_price: { type: Number, required: true },
  booking_date: { type: Date, required: true },
  booking_time: { type: String, required: true }
}, { timestamps: true });

// Virtual for booking_id
bookingSchema.virtual('booking_id').get(function() {
  return this._id.toString();
});

bookingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.booking_id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
