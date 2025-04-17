import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional } from "class-validator"

export class MerchantLoginDto {
  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password!: string
}

export class MerchantRegisterDto {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsString()
  @IsNotEmpty()
  public location!: string

  @IsString()
  @IsNotEmpty()
  public contactPerson!: string

  @IsString()
  @IsNotEmpty()
  public contactPhone!: string

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password!: string

  @IsString()
  @IsOptional()
  public description?: string
}

export class MerchantVerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsNotEmpty()
  public code!: string
}

export class MerchantResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsNotEmpty()
  public code!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public newPassword!: string
}

export class MerchantRequestResetDto {
  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public email!: string
}
