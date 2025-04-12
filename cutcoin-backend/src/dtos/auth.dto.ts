import { IsString, IsNotEmpty, MinLength, IsPhoneNumber, IsOptional, IsObject } from "class-validator"

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber(undefined)
  public phoneNumber!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  public pin!: string

  @IsString()
  @IsNotEmpty()
  public firstName!: string

  @IsString()
  @IsNotEmpty()
  public lastName!: string
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsString()
  @IsNotEmpty()
  public pin!: string
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber(undefined)
  public phoneNumber!: string

  @IsString()
  @IsNotEmpty()
  public code!: string

  @IsString()
  @IsNotEmpty()
  public purpose!: string
}

export class VerifyLoginOtpDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsString()
  @IsNotEmpty()
  public code!: string
}

export class RequestPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber(undefined)
  public phoneNumber!: string
}

export class ResetPinDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsString()
  @IsNotEmpty()
  public code!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  public newPin!: string
}

export class KycDto {
  @IsString()
  @IsNotEmpty()
  public idNumber!: string

  @IsString()
  @IsNotEmpty()
  public address!: string

  @IsString()
  @IsOptional()
  public dateOfBirth?: string

  @IsString()
  @IsOptional()
  public gender?: string

  @IsObject()
  @IsOptional()
  public additionalInfo?: object
}
