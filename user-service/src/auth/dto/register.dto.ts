import {ApiProperty} from "@nestjs/swagger"
import { Role } from "@prisma/client";
import {IsBoolean, IsEmail,IsEnum,IsOptional,IsString,MinLength} from "class-validator"

export class RegisterDto{
    @ApiProperty({description: "The email of the user"})
    @IsEmail()
    email: string;

    @ApiProperty({description: "The first name of the user"})
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({description: "The last name of the user"})
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({description: "The phone number of the user"})
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({description: "The address of the user"})
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({description: "The URL of the user's profile image"})// going to be integrated with cloudinary
    @IsString()
    @IsOptional()
    imageUrl?: string;
    
    @ApiProperty({description: "The password of the user"})// going to be hashed and stored in the database
    @IsString()
    @MinLength(8)
    password: string;
}