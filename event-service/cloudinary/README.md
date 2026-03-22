# Cloudinary Configuration Guide

This directory contains Cloudinary setup for handling image uploads in the event service.

## Files

- `cloudinary.js` - Cloudinary SDK initialization
- `upload.js` - Multer middleware configuration for Cloudinary storage
- `cloudinaryHelper.js` - Helper functions for image management (upload, delete, etc.)

## Setup

### 1. Get Cloudinary Credentials

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard and note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables

Create a `.env` file in the **event-service** root directory with the following:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. File Upload Configuration

The current setup supports:

- **Max File Size**: 5MB
- **Allowed Formats**: JPG, JPEG, PNG, GIF, WebP
- **Storage Folder**: `event-service/events`

## API Endpoints

### Upload Cover Image

```
POST /event/:id/cover-image
Content-Type: multipart/form-data

Body:
- coverImage: [file]
```

### Upload Gallery Images

```
POST /event/:id/gallery-images
Content-Type: multipart/form-data

Body:
- galleryImages: [file1, file2, ...]  (up to 10 files)
```

### Delete Image

```
DELETE /event/:id/image
Content-Type: application/json

Body:
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

## Usage Examples

### Upload Cover Image (cURL)

```bash
curl -X POST http://localhost:3000/event/660f1c2e2f8fb814c89b1234/cover-image \
  -F "coverImage=@/path/to/image.jpg" \
  -H "Authorization: Bearer [token]"
```

### Upload Gallery Images (cURL)

```bash
curl -X POST http://localhost:3000/event/660f1c2e2f8fb814c89b1234/gallery-images \
  -F "galleryImages=@/path/to/image1.jpg" \
  -F "galleryImages=@/path/to/image2.jpg" \
  -H "Authorization: Bearer [token]"
```

### Delete Image (cURL)

```bash
curl -X DELETE http://localhost:3000/event/660f1c2e2f8fb814c89b1234/image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://res.cloudinary.com/..."}' \
  -H "Authorization: Bearer [token]"
```

## Notes

- Images are automatically uploaded to Cloudinary and stored URLs are saved in MongoDB
- Deleting an image from the event removes it from Cloudinary storage
- All image endpoints require admin authentication (validateAdmin middleware)
- Image optimization is handled by Cloudinary
