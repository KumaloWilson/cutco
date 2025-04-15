import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from "class-validator"

export class RegisterMerchantDto {
  @IsString()
  @IsNotEmpty()
  public name!: string

  @IsString()
  @IsNotEmpty()
  public location!: string

  @IsString()
  @IsOptional()
  public description?: string

  @IsString()
  @IsNotEmpty()
  public contactPerson!: string

  @IsString()
  @IsNotEmpty()
  public contactPhone!: string
}

export class UpdateMerchantDto {
  @IsString()
  @IsOptional()
  public name?: string

  @IsString()
  @IsOptional()
  public location?: string

  @IsString()
  @IsOptional()
  public description?: string

  @IsString()
  @IsOptional()
  public contactPerson?: string

  @IsString()
  @IsOptional()
  public contactPhone?: string
}

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  public customerStudentId!: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public description!: string
}

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsNotEmpty()
  public customerStudentId!: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public code!: string

  @IsString()
  @IsNotEmpty()
  public description!: string
}
