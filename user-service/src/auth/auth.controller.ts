import {
    Body,
    Get,
    UseGuards,
    Controller,
    Post,
    UsePipes,
    ValidationPipe,
    Put,
  } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
// import type { User } from "@prisma/client";
import { CurrentUser } from "./decorators/current-user.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgetPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";


@Controller("auth")
@ApiTags("Auth")
@UsePipes(new ValidationPipe({transform:true}))
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @ApiOperation({summary: "Register a new user"})
    @ApiResponse({status: 201, description: "User registered successfully"})
    @ApiResponse({status: 409, description: "User already exists"})
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Post("login")
    @ApiOperation({summary: "Login a user"})
    @ApiResponse({status: 200, description: "User logged in successfully"})
    @ApiResponse({status: 401, description: "Invalid credentials"})
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    

    @Put("change-password")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({summary: "Change password of user"})
    @ApiResponse({status: 200, description: "Password changed successfully"})
    @ApiResponse({status: 401, description: "Unauthorized"})
    async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser("id") userId: string) {
        return this.authService.changePassword(userId, dto)
    }

    @Post("forget-password")
    @ApiOperation({summary: "Forget password of user"})
    @ApiResponse({status: 200, description: "Password reset email sent successfully"})
    @ApiResponse({status: 400, description: "User not found"})
    async forgetPassword(@Body() dto: ForgetPasswordDto) {
        return this.authService.forgetPassword(dto)
    }

    @Post("reset-password")
    @ApiOperation({summary: "Reset password of user"})
    @ApiResponse({status: 200, description: "Password reset successfully"})
    @ApiResponse({status: 400, description: "Invalid OTP"})
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto)
    }

    @Get("validate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({summary: "Validate user and return current user"})
    @ApiResponse({status: 200, description: "Current user returned successfully"})
    @ApiResponse({status: 401, description: "Unauthorized"})
    async validate(@CurrentUser() user: any) {
        return this.authService.validateToken(user)
    }
}