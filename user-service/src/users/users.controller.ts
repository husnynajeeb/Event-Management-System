import {
  Controller,
  Get,
  UseGuards,
  Put,
  Param,
  Patch,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  Delete,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetUsersQueryDto } from "./dto/get-users.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("users")
@ApiTags("Users")
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Get all users" })
    @ApiResponse({ status: 200, description: "Users retrieved successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    async getUsers(@Query() query: GetUsersQueryDto) {
        const { page = 1, limit = 10 } = query
        return this.usersService.getAllUsers(page, limit)
    }

    @Put("/deactivate/:id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Deactivate user" })
    @ApiResponse({ status: 200, description: "User deactivated successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async deactivateUser(@Param("id") id: string) {
        return this.usersService.deactivateUser(id)
    }

    @Put("/activate/:id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Activate user" })
    @ApiResponse({ status: 200, description: "User activated successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async activateUser(@Param("id") id: string) {
        return this.usersService.activateUser(id)
    }


    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: "Get current user" })
    @ApiResponse({ status: 200, description: "Current user retrieved successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async getProfile(@CurrentUser() user: any) {
        return this.usersService.getProfile(user)
    }

    @Patch("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: "Update current user" })
    @ApiResponse({ status: 200, description: "Current user updated successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async updateProfile(@Body() data: UpdateUserDto, @CurrentUser() user: any) {
        return this.usersService.updateProfile(user, data)
    }

    @Patch("me/avatar")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatar: { type: 'string', format: 'binary' }
            }
        }
    })
    @ApiOperation({ summary: "Update current user's avatar" })
    @ApiResponse({ status: 200, description: "Current user's avatar updated successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @UseInterceptors(FileInterceptor('avatar'))
    async updateAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
        return this.usersService.updateAvatar(user, file)
    }

    @Delete("me/avatar")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: "Delete current user's avatar" })
    @ApiResponse({ status: 200, description: "Current user's avatar deleted successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async deleteAvatar(@CurrentUser() user: any) {
        return this.usersService.deleteAvatar(user)
    }   
}