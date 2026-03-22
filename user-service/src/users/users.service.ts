import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { sanitizeUser } from "./user.utils";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly cloudinaryService: CloudinaryService) { }

    async getAllUsers(page: number, limit: number) {
        const skip = (page - 1) * limit
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take: limit
            }),
            this.prisma.user.count()
        ])
        return { items: items.map(sanitizeUser), total, page, limit }
    }

    async deactivateUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })
        if (!user) {
            throw new NotFoundException("User not found")
        }
        if (!user.isActive) {
            throw new BadRequestException("User is already deactivated")
        }
        if (user.role === Role.ADMIN) {
            throw new BadRequestException("Admin cannot be deactivated")
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: false }
        })
        return { message: "User deactivated successfully" }

    }

    async activateUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })
        if (!user) {
            throw new NotFoundException("User not found")
        }
        if (user.isActive) {
            throw new BadRequestException("User is already activated")
        }
        if (user.role === Role.ADMIN) {
            throw new BadRequestException("Admin cannot be activated")
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: true }
        })
        return { message: "User activated successfully" }
    }

    async getProfile(user: User) {
        return sanitizeUser(user)
    }

    async updateProfile(user: User, data: UpdateUserDto) {

        const existingUser = await this.prisma.user.findUnique({
            where: { id: user.id }
        })
        if (!existingUser) {
            throw new NotFoundException("User not found")
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: data
        })
        return { message: "User updated successfully", user: sanitizeUser(updatedUser) }
    }

    async updateAvatar(user: User, file: Express.Multer.File) {
        const cloudinaryResponse = await this.cloudinaryService.uploadImage(file)
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { imageUrl: cloudinaryResponse.secure_url }
        })
        return { message: "Avatar updated successfully", user: sanitizeUser(updatedUser) }
    }

    async deleteAvatar(user: User) {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { imageUrl: null }
        })
        return { message: "Avatar deleted successfully", user: sanitizeUser(updatedUser) }
    }

    // private sanitizeUser(user: User) {
    //     const { password, ...rest } = user
    //     return rest
    // }
}