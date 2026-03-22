import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength } from "class-validator"

export class ChangePasswordDto{
    @ApiProperty({example: "oldPassword123",description: "The old password of the user"})
    @IsString()
    @MinLength(8)
    oldPassword: string;

    @ApiProperty({example: "newPassword123",minLength: 8,description: "The new password of the user"})
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    newPassword: string;
}