import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateUserDto{
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

    @ApiProperty({description: "The URL of the user's profile image"})
    @IsString()
    @IsOptional()
    imageUrl?: string;
}