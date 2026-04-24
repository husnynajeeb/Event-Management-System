import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    // ✅ Use ConfigService consistently instead of process.env directly
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
    });
  }

  /**
   * Upload a file buffer to Cloudinary.
   * Used by both PATCH /users/me/avatar and any other upload endpoint.
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = "user-profile",
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Limit to 5MB on Cloudinary side as a safety net
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      stream.end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary by its public_id.
   * Called before uploading a new avatar so old images don't pile up.
   * public_id is the path without file extension, e.g. "user-profile/abc123"
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      // Non-fatal — log and continue. The old image may already be gone.
      console.error(`[Cloudinary] Failed to delete image ${publicId}:`, err);
    }
  }

  /**
   * Extract the Cloudinary public_id from a full secure_url.
   * e.g. "https://res.cloudinary.com/demo/image/upload/v123/user-profile/abc.jpg"
   *   → "user-profile/abc"
   */
  extractPublicId(imageUrl: string): string | null {
    try {
      // Match everything after /upload/v<digits>/ and strip the file extension
      const match = imageUrl.match(/\/upload\/v\d+\/(.+)\.[a-z]+$/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}