const express = require("express");
const router = express.Router();
const adminBookingController = require("../controllers/adminBookingController");
const validateAdminMiddleware = require("../middleware/validateAdminMiddleware");

router.get("/", validateAdminMiddleware, adminBookingController.getAllBookings);
router.get("/:id", validateAdminMiddleware, adminBookingController.getBookingByIdAdmin);
router.put("/:id", validateAdminMiddleware, adminBookingController.updateBookingAdmin);
router.delete("/:id", validateAdminMiddleware, adminBookingController.deleteBookingAdmin);

module.exports = router;