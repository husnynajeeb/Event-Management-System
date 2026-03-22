export function generateSeats(rows, cols, type = "Regular", price = 2000) {
  const seats = [];

  for (let r = 1; r <= rows; r++) {
    const rowLetter = String.fromCharCode(64 + r);

    for (let c = 1; c <= cols; c++) {
      seats.push({
        type,
        price,
        row: r,
        column: c,
        seatNumber: `${rowLetter}-${c}`,
        bookingStatus: "available",
      });
    }
  }

  return seats;
}
