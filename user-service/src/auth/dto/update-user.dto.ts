import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ description: "The first name of the user" })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: "The last name of the user" })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: "The phone number of the user" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: "The address of the user" })
  @IsString()
  @IsOptional()
  address?: string;

  // ✅ imageUrl intentionally excluded.
  // Clients cannot set a raw image URL — use PATCH /users/me/avatar
  // which validates, uploads to Cloudinary, and sets the URL server-side.
}