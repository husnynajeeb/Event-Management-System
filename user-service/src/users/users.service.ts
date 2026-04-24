import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { sanitizeUser } from "./user.utils";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ─── Admin ───────────────────────────────────────────────────────────────

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // ✅ deterministic pagination
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map(sanitizeUser),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deactivateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "User deactivated successfully" };
  }

  async activateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: "User activated successfully" };
  }

  // ─── Profile ─────────────────────────────────────────────────────────────

  async getProfile(user: any) {
    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!found) throw new NotFoundException("User not found");
    return sanitizeUser(found);
  }

  async updateProfile(user: any, data: UpdateUserDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return sanitizeUser(updated);
  }

  // ─── Avatar ───────────────────────────────────────────────────────────────

  /**
   * Upload a new avatar to Cloudinary and save the URL to the user record.
   * If the user already has an avatar, the old Cloudinary image is deleted first.
   */
  async updateAvatar(user: any, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.",
      );
    }

    // Validate file size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("File too large. Maximum size is 5MB.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    // ✅ Delete old Cloudinary image before uploading the new one
    if (existing?.imageUrl) {
      const publicId = this.cloudinary.extractPublicId(existing.imageUrl);
      if (publicId) {
        await this.cloudinary.deleteImage(publicId);
      }
    }

    // Upload new image to Cloudinary
    const result = await this.cloudinary.uploadImage(file, "user-profile");

    // Save the Cloudinary secure URL to the DB
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { imageUrl: result.secure_url },
    });

    return {
      message: "Avatar updated successfully",
      imageUrl: updated.imageUrl,
      user: sanitizeUser(updated),
    };
  }

  /**
   * Remove the user's avatar from Cloudinary and clear the DB field.
   */
  async deleteAvatar(user: any) {
    const existing = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!existing?.imageUrl) {
      throw new BadRequestException("No avatar to delete");
    }

    // Delete from Cloudinary
    const publicId = this.cloudinary.extractPublicId(existing.imageUrl);
    if (publicId) {
      await this.cloudinary.deleteImage(publicId);
    }

    // Clear the DB field
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { imageUrl: null },
    });

    return {
      message: "Avatar deleted successfully",
      user: sanitizeUser(updated),
    };
  }
}