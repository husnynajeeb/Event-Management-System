import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength } from "class-validator"

export class ResetPasswordDto{
    @ApiProperty({example: "user@example.com",description: "The email of the user"})
    @IsEmail()
    email: string;

    @ApiProperty({example: "123456",description: "The OTP of the user"})
    @IsString()
    @MinLength(6)
    otp: string;

    @ApiProperty({example: "newPassword123",minLength: 8,description: "The new password of the user"})
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    newPassword: string;
}