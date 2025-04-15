import { IsEmail, IsOptional, IsString, Length, Matches } from "class-validator"

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+263|0)(?:7[7-8]|86)\d{7}$/, {
    message: "Phone number must be a valid Zimbabwe mobile number",
  })
  phoneNumber?: string

  @IsOptional()
  @IsString()
  profilePicture?: string
}
