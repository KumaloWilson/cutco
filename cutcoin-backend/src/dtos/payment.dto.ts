import { IsNumber, IsString, IsNotEmpty, Min, IsOptional } from "class-validator"

export class InitiatePaynowPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number
}

export class InitiateCashDepositDto {
  @IsString()
  @IsNotEmpty()
  public studentId!: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public cashAmount!: number

  @IsString()
  @IsOptional()
  public notes?: string
}

export class UpdateExchangeRateDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  public rate!: number
}

export class MerchantDepositLimitsDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public daily!: number

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public monthly!: number
}
