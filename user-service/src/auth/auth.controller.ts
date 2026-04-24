import {
  Body,
  Get,
  UseGuards,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgetPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
@ApiTags("Auth")
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  // ✅ FIX: Was documenting 409 but throwing 400. Now correctly 409 (ConflictException).
  @ApiResponse({ status: 409, description: "User already exists" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ================= GOOGLE AUTH =================

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Passport redirects to Google automatically
  }

  @Get("google/callback")
@UseGuards(AuthGuard("google"))
async googleCallback(@Req() req, @Res() res: Response) {
  const { accessToken } = await this.authService.googleLogin(req.user);

  const frontendUrl = this.configService.get<string>(
    "FRONTEND_URL",
    "http://localhost:3000",
  );

  res.cookie("auth_token", accessToken, {
    httpOnly: false, // or true if backend-only auth
    secure: false,
  });

  return res.redirect(`${frontendUrl}/callback?token=${accessToken}`);
//                              ↑ not /auth/callback
}

  @Put("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Change password of user" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Post("forget-password")
  @ApiOperation({ summary: "Forget password of user" })
  @ApiResponse({ status: 200, description: "Password reset email sent successfully" })
  @ApiResponse({ status: 400, description: "User not found" })
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password of user" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid OTP" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("validate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Validate user and return current user" })
  @ApiResponse({ status: 200, description: "Current user returned successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async validate(@CurrentUser() user: any) {
    return this.authService.validateToken(user);
  }
}