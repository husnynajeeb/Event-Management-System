import Event from "../model/event.model.js";
import { generateSeats } from "../utils/seatGenerator.js";
import {
  deleteImage,
  getImageUrl,
  getImageUrls,
  deleteMultipleImages,
} from "../cloudinary/cloudinaryHelper.js";

export async function createEvent(req, res) {
  try {
    console.log("=== CREATE EVENT DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files ? Object.keys(req.files) : "no files");
    console.log("========================");

    // req.body contains both text fields and file metadata when using multer.fields()
    // Parse JSON string fields if they come as strings
    const parseFormValue = (val) => {
      if (typeof val === "string" && (val === "true" || val === "false")) {
        return val === "true";
      }
      if (typeof val === "string" && !isNaN(val) && val !== "") {
        return Number(val);
      }
      return val;
    };

    const body = req.body || {};
    const {
      title,
      start,
      end,
      isSeated,
      rows,
      cols,
      seatType,
      seatPrice,
      ...rest
    } = body;

    // Parse numeric and boolean values from form data
    const parsedIsSeated = parseFormValue(isSeated);
    const parsedRows = parseFormValue(rows);
    const parsedCols = parseFormValue(cols);
    const parsedSeatPrice = parseFormValue(seatPrice);

    // Basic validation
    if (!title || !start || !end) {
      console.error("Validation failed - Missing required fields");
      console.error("Data received:", { title, start, end });
      console.error("Full body:", body);
      return res.status(400).json({
        message: "Title, start, and end are required.",
        received: { title, start, end },
        bodyKeys: Object.keys(body),
      });
    }

    if (new Date(end) <= new Date(start)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    let seats = [];
    if (parsedIsSeated) {
      if (!parsedRows || !parsedCols || parsedRows < 1 || parsedCols < 1) {
        return res.status(400).json({
          message:
            "Rows and columns must be positive numbers for seated events.",
        });
      }
      seats = generateSeats(
        parsedRows,
        parsedCols,
        seatType || "Regular",
        parsedSeatPrice || 2000,
      );
    }

    // Handle image uploads from multipart/form-data
    let coverImageUrl = null;
    let galleryImageUrls = [];

    if (req.files) {
      // Get cover image URL if uploaded
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageUrl = getImageUrl(req.files.coverImage[0]);
      }

      // Get gallery images URLs if uploaded
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        galleryImageUrls = getImageUrls(req.files.galleryImages);
      }
    }

    const eventData = {
      title,
      start,
      end,
      isSeated: parsedIsSeated,
      seats,
      ...(coverImageUrl && { coverImage: coverImageUrl }),
      ...(galleryImageUrls.length > 0 && { galleryImages: galleryImageUrls }),
    };

    // Add optional fields
    if (rest.description) eventData.description = rest.description;
    if (rest.location) eventData.location = rest.location;
    if (rest.status) eventData.status = rest.status;
    if (rest.tags)
      eventData.tags = Array.isArray(rest.tags) ? rest.tags : [rest.tags];

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({ message: error.message });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      start,
      end,
      location,
      status,
      tags,
      isSeated,
      seats,
      coverImage,
      galleryImages,
    } = req.body;

    // Validate date logic if both provided
    if (start && end && new Date(end) <= new Date(start)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date." });
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(start && { start }),
      ...(end && { end }),
      ...(location && { location }),
      ...(status && { status }),
      ...(tags && { tags }),
      ...(isSeated !== undefined && { isSeated }),
      ...(seats && { seats }),
      ...(coverImage && { coverImage }),
      ...(galleryImages && { galleryImages }),
    };

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete Event Controller
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Upload Cover Image Controller
export async function uploadCoverImage(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete old cover image if it exists
    if (event.coverImage) {
      await deleteImage(event.coverImage);
    }

    // Get new image URL from Cloudinary
    const coverImageUrl = getImageUrl(req.file);

    // Update event with new cover image
    event.coverImage = coverImageUrl;
    await event.save();

    res.status(200).json({
      message: "Cover image uploaded successfully",
      event,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Upload Gallery Images Controller
export async function uploadGalleryImages(req, res) {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get new image URLs from Cloudinary
    const newGalleryUrls = getImageUrls(req.files);

    // Add to existing gallery images
    if (!event.galleryImages) {
      event.galleryImages = [];
    }
    event.galleryImages.push(...newGalleryUrls);

    await event.save();

    res.status(200).json({
      message: "Gallery images uploaded successfully",
      event,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete Event Image Controller
export async function deleteEventImage(req, res) {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete from Cloudinary
    await deleteImage(imageUrl);

    // Remove from coverImage if it matches
    if (event.coverImage === imageUrl) {
      event.coverImage = null;
    }

    // Remove from gallery images
    if (event.galleryImages && event.galleryImages.includes(imageUrl)) {
      event.galleryImages = event.galleryImages.filter(
        (img) => img !== imageUrl,
      );
    }

    await event.save();

    res.status(200).json({
      message: "Image deleted successfully",
      event,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
