import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsBoolean, IsEnum } from "class-validator"

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  public username!: string

  @IsString()
  @IsNotEmpty()
  public password!: string
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  public username!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password!: string

  @IsString()
  @IsNotEmpty()
  public fullName!: string

  @IsEmail()
  @IsNotEmpty()
  public email!: string

  @IsString()
  @IsNotEmpty()
  public phoneNumber!: string

  @IsEnum(["super_admin", "admin", "support"])
  @IsNotEmpty()
  public role!: string
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  public fullName?: string

  @IsEmail()
  @IsOptional()
  public email?: string

  @IsString()
  @IsOptional()
  public phoneNumber?: string

  @IsString()
  @IsOptional()
  @MinLength(6)
  public password?: string
}

export class UpdateUserStatusDto {
  @IsEnum(["pending", "verified", "rejected"])
  @IsOptional()
  public kycStatus?: string

  @IsBoolean()
  @IsOptional()
  public isActive?: boolean
}

export class UpdateMerchantStatusDto {
  @IsEnum(["pending", "approved", "rejected", "suspended"])
  @IsOptional()
  public status?: string

  @IsBoolean()
  @IsOptional()
  public isActive?: boolean
}

export class SystemConfigDto {
  @IsString()
  @IsNotEmpty()
  public key!: string

  @IsString()
  @IsNotEmpty()
  public value!: string

  @IsString()
  @IsOptional()
  public description?: string
}
