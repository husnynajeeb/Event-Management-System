# Event Creation with Images - Testing Guide

## Important: How to Send Requests

### ✅ CORRECT: Using Postman or cURL

When sending multipart/form-data, you must send it as **form fields**, not JSON.

### cURL Example (Single Image):

```bash
curl -X POST http://localhost:3000/events/create \
  -H "Authorization: Bearer your_admin_token" \
  -F "title=Concert Event" \
  -F "start=2026-04-20T10:00:00Z" \
  -F "end=2026-04-20T18:00:00Z" \
  -F "location=Central Park" \
  -F "isSeated=true" \
  -F "rows=10" \
  -F "cols=15" \
  -F "seatType=Regular" \
  -F "seatPrice=5000" \
  -F "coverImage=@/path/to/cover.jpg"
```

### cURL Example (Multiple Images):

```bash
curl -X POST http://localhost:3000/events/create \
  -H "Authorization: Bearer your_admin_token" \
  -F "title=Music Festival" \
  -F "start=2026-04-20T10:00:00Z" \
  -F "end=2026-04-20T18:00:00Z" \
  -F "location=Park Arena" \
  -F "description=Amazing music event" \
  -F "isSeated=true" \
  -F "rows=20" \
  -F "cols=30" \
  -F "seatType=VIP" \
  -F "seatPrice=10000" \
  -F "coverImage=@/path/to/cover.jpg" \
  -F "galleryImages=@/path/to/image1.jpg" \
  -F "galleryImages=@/path/to/image2.jpg" \
  -F "galleryImages=@/path/to/image3.jpg"
```

### Using Postman:

1. **Method**: POST
2. **URL**: `http://localhost:3000/events/create`
3. **Headers**:
   - `Authorization: Bearer your_admin_token`
4. **Body**: Select **form-data** (NOT raw JSON)
5. **Fields**:
   - `title` (text) = "Concert Event"
   - `start` (text) = "2026-04-20T10:00:00Z"
   - `end` (text) = "2026-04-20T18:00:00Z"
   - `location` (text) = "Central Park"
   - `isSeated` (text) = "true"
   - `rows` (text) = "10"
   - `cols` (text) = "15"
   - `seatType` (text) = "Regular"
   - `seatPrice` (text) = "5000"
   - `coverImage` (file) = [select image file]
   - `galleryImages` (file) = [select image files] (add multiple)

### ❌ WRONG: Don't Send as Raw JSON

```json
{
  "title": "Concert Event",
  "start": "2026-04-20T10:00:00Z"
}
```

---

## String Values from Form Data

Form data sends everything as **strings**, so the controller automatically converts:

- `"true"` or `"false"` → boolean
- `"10"`, `"5000"` → numbers
- Text stays as text

---

## Expected Response:

```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "660f1c2e2f8fb814c89b1234",
    "title": "Concert Event",
    "start": "2026-04-20T10:00:00Z",
    "end": "2026-04-20T18:00:00Z",
    "location": "Central Park",
    "isSeated": true,
    "rows": 10,
    "cols": 15,
    "seatType": "Regular",
    "seatPrice": 5000,
    "coverImage": "https://res.cloudinary.com/...",
    "galleryImages": [
      "https://res.cloudinary.com/...",
      "https://res.cloudinary.com/..."
    ],
    "createdAt": "2026-03-21T12:00:00Z"
  }
}
```

---

## Troubleshooting

| Error                                 | Solution                                             |
| ------------------------------------- | ---------------------------------------------------- |
| "Cannot destructure property 'title'" | Make sure Body is set to **form-data**, not raw JSON |
| "No image file provided"              | Check that you're uploading files as form fields     |
| "Invalid file type"                   | Use JPG, PNG, GIF, or WebP only                      |
| File size error                       | Files must be under 5MB                              |
| CORS error                            | Check Authorization header is correct                |
