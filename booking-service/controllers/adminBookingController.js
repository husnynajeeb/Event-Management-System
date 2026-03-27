const Booking = require("../models/Booking");
const { validateEvent, updateEvent } = require("../services/eventServiceClient");

// Admin - view all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin - view one booking
exports.getBookingByIdAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin - update any booking
exports.updateBookingAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const existingBooking = await Booking.findById(req.params.id);

    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updateData = {
      customer_name: req.body.customer_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      ticket_price: req.body.ticket_price,
    };

    const requestedSeatNumber = req.body.seat_number;
    const currentSeatNumber = existingBooking.seat_number;

    if (requestedSeatNumber !== undefined || currentSeatNumber) {
      const event = await validateEvent(existingBooking.event_id);
      if (!event) {
        return res.status(400).json({ error: "Invalid event_id" });
      }

      if (event.isSeated) {
        const nextSeatNumber = requestedSeatNumber || currentSeatNumber;

        if (!nextSeatNumber) {
          return res
            .status(400)
            .json({ error: "seat_number is required for seated events" });
        }

        const oldSeatIndex = (event.seats || []).findIndex(
          (seat) => seat.seatNumber === currentSeatNumber,
        );
        const newSeatIndex = (event.seats || []).findIndex(
          (seat) => seat.seatNumber === nextSeatNumber,
        );

        if (newSeatIndex === -1) {
          return res.status(400).json({ error: "Invalid seat selection" });
        }

        if (
          currentSeatNumber !== nextSeatNumber &&
          event.seats[newSeatIndex].bookingStatus !== "available"
        ) {
          return res.status(409).json({ error: "Seat is already reserved/sold" });
        }

        const updatedSeats = [...event.seats];

        if (oldSeatIndex !== -1 && currentSeatNumber !== nextSeatNumber) {
          updatedSeats[oldSeatIndex] = {
            ...updatedSeats[oldSeatIndex],
            bookingStatus: "available",
            reservedUntil: null,
            bookedBy: null,
            bookingTime: null,
          };
        }

        updatedSeats[newSeatIndex] = {
          ...updatedSeats[newSeatIndex],
          bookingStatus: "reserved",
          reservedUntil: new Date(Date.now() + 10 * 60 * 1000),
          bookingTime: new Date(),
        };

        await updateEvent(event._id, { seats: updatedSeats }, token);

        updateData.seat_number = nextSeatNumber;
        updateData.ticket_price = updatedSeats[newSeatIndex].price;
      }
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin - delete any booking
exports.deleteBookingAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.event_id && booking.seat_number) {
      const event = await validateEvent(booking.event_id);

      if (event && event.isSeated) {
        const seatIndex = (event.seats || []).findIndex(
          (seat) => seat.seatNumber === booking.seat_number,
        );

        if (seatIndex !== -1) {
          const updatedSeats = [...event.seats];
          updatedSeats[seatIndex] = {
            ...updatedSeats[seatIndex],
            bookingStatus: "available",
            reservedUntil: null,
            bookedBy: null,
            bookingTime: null,
          };

          await updateEvent(event._id, { seats: updatedSeats }, token);
        }
      }
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};