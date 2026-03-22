import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "event-service/events",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    format: async (req, file) => {
      const ext = file.mimetype.split("/")[1];
      return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
    },
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

// Middleware to merge multipart fields into req.body
export const mergeFormFields = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    // Fields from multer are in req.body for .fields()
    // Just pass through to next middleware
    next();
  } else {
    next();
  }
};

// Middleware for creating event with cover and gallery images
export const uploadEventImages = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

// Middleware for cover image only (for updating)
export const uploadCover = upload.single("coverImage");

// Middleware for gallery images only (for updating)
export const uploadGallery = upload.array("galleryImages", 10);

export default upload;
