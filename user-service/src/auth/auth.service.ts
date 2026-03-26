import * as bcrypt from "bcrypt"
import { PrismaService } from "../prisma/prisma.service"
import { RegisterDto } from "./dto/register.dto"
import { BadRequestException, Injectable } from "@nestjs/common"
import { Role, User } from "@prisma/client"
import { JwtService } from "@nestjs/jwt"
import { LoginDto } from "./dto/login.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { ForgetPasswordDto } from "./dto/forgot-password.dto"
import { MailService } from "../mail/mail.service"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { sanitizeUser } from "src/users/user.utils"

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService, private mailService: MailService) { }

    // register a new user
    async register(data: RegisterDto) {

        //check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        if (existingUser) {
            throw new BadRequestException("User already exists")
        }

        //hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        //create user
        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: data.role ?? Role.USER,
                isActive: true
            }
        })
        const token = this.issueToken(user)
        return {
            user: sanitizeUser(user),
            accessToken: token
        }
    }

    // login a user
    async login(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })
        if (!user) {
            throw new BadRequestException("Invalid credentials")
        }

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) {
            throw new BadRequestException("Invalid credentials")
        }
        const token = this.issueToken(user)
        return {
            user: sanitizeUser(user),
            accessToken: token
        }
    }

    // validate user by id
    async validateUserById(userId: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            return user ?? null
        } catch {
            // If DB is temporarily unreachable, fail auth gracefully
            // instead of bubbling an internal Prisma exception.
            return null
        }
    }

    // get profile of user
    

    // forget password of user
    async forgetPassword(dto: ForgetPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        })
        const message = "If an account with this email exists, you will receive an email with instructions to reset your password."
        if (!user) {
            return { message: message }
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
        await this.prisma.passwordResetOtp.deleteMany({ where: { email: dto.email } })
        await this.prisma.passwordResetOtp.create({
            data: {
                email: dto.email,
                otp: otp,
                expiresAt: expiresAt
            }
        })
        try {
            await this.mailService.sendMail({
                to: dto.email,
                subject: "Password Reset OTP",
                text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.If you did not request a password reset, please ignore this email.`,
                html: `<p>Your password reset OTP is ${otp}. It will expire in 10 minutes.If you did not request a password reset, please ignore this email.</p>`
            })
        } catch (error) {
            //delete otp if email sending fails
            await this.prisma.passwordResetOtp.deleteMany({ where: { email: dto.email } })
            throw new BadRequestException("Failed to send email. Please try again later.")
        }
        return { message: message }
    }

    // reset password of user
    async resetPassword(dto: ResetPasswordDto) {
        const email = dto.email.toLowerCase().trim();
        //check if otp is valid
        const record = await this.prisma.passwordResetOtp.findFirst({
            where: { email: email ,otp: dto.otp}
        })
        if (!record || record.expiresAt < new Date()) {
            throw new BadRequestException("Invalid or Expired OTP Please request a new OTP")
        }

        const user = await this.prisma.user.findUnique({
            where: { email: email }
        })
        if (!user) {
            throw new BadRequestException("Invalid or Expired OTP")
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            }),
            this.prisma.passwordResetOtp.deleteMany({
                where: { email }
            })
        ])
        return { message: "Password reset successfully. Please login with your new password" }
    }

    // change password of user
    async changePassword(userId: string, dto: ChangePasswordDto) {
        if (dto.oldPassword === dto.newPassword) {
            throw new BadRequestException("New password cannot be the same as the current password")
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        if (!user) {
            throw new BadRequestException("User not found")
        }
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password)
        if (!isMatch) {
            throw new BadRequestException("Current password is incorrect")
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })
        return { message: "Password changed successfully" }
    }

    // issue token to user
    private issueToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        }
        return this.jwtService.sign(payload)
    }

    // validate token
    async validateToken(user: User) {
        return { message: "Token validated successfully", user: sanitizeUser(user) }
    }

    // remove password from user object
    // private sanitizeUser(user: User) {
    //     const { password, ...rest } = user
    //     return rest
    // }
}