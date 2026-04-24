import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaModule } from "../prisma/prisma.module";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@Module({
  imports: [
    PrismaModule,
    // ✅ memoryStorage so CloudinaryService receives file.buffer
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap at Multer level
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CloudinaryService, // ✅ inject so UsersService can call it
    RolesGuard,        // ✅ needed for admin-only routes
  ],
  exports: [UsersService],
})
export class UsersModule {}