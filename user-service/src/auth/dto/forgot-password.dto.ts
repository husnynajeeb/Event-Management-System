import { ApiProperty } from "@nestjs/swagger"
import { IsEmail } from "class-validator"

export class ForgetPasswordDto{
    @ApiProperty({example: "user@example.com",description: "The email of the user"})
    @IsEmail()
    email: string;
}