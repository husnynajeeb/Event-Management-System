import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgetPasswordDto } from "./dto/forgot-password.dto";
import { MailService } from "../mail/mail.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { sanitizeUser } from "src/users/user.utils";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  // register a new user
  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    });

    const token = this.issueToken(user);

    return {
      user: sanitizeUser(user),
      accessToken: token,
    };
  }

  // login a user
  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    // ✅ FIX: handle null password (Google users)
    if (!user.password) {
      throw new UnauthorizedException("Use Google login for this account");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new BadRequestException("Invalid credentials");
    }

    const token = this.issueToken(user);

    return {
      user: sanitizeUser(user),
      accessToken: token,
    };
  }

  // ================= GOOGLE LOGIN =================
  async googleLogin(googleUser: any) {
    const email = googleUser.email;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          password: null, // ✅ requires Prisma: password String?
          role: Role.USER,
          isActive: true,
        },
      });
    }

    const token = this.issueToken(user);

    return {
      user: sanitizeUser(user),
      accessToken: token,
    };
  }

  // validate user by id
  async validateUserById(userId: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
      });
    } catch {
      return null;
    }
  }

  // forget password
  async forgetPassword(dto: ForgetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const message =
      "If an account with this email exists, you will receive an email with instructions.";

    if (!user) return { message };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.passwordResetOtp.deleteMany({
      where: { email: dto.email },
    });

    await this.prisma.passwordResetOtp.create({
      data: { email: dto.email, otp, expiresAt },
    });

    try {
      await this.mailService.sendMail({
        to: dto.email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}`,
        html: `<p>Your OTP is ${otp}</p>`,
      });
    } catch {
      await this.prisma.passwordResetOtp.deleteMany({
        where: { email: dto.email },
      });
      throw new BadRequestException("Failed to send email");
    }

    return { message };
  }

  // reset password
  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    const record = await this.prisma.passwordResetOtp.findFirst({
      where: { email, otp: dto.otp },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired OTP");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException("Invalid OTP");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetOtp.deleteMany({ where: { email } }),
    ]);

    return { message: "Password reset successfully" };
  }

  // change password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException("New password cannot be the same");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // ✅ FIX: handle null password
    if (!user.password) {
      throw new UnauthorizedException("Google account cannot change password");
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  private issueToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async validateToken(user: User) {
    return {
      message: "Token valid",
      user: sanitizeUser(user),
    };
  }
}