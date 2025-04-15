import { IsNumber, IsString, IsNotEmpty, Min } from "class-validator"

export class InitiateDepositDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string
}

export class MerchantConfirmTransactionDto {
  @IsString()
  @IsNotEmpty()
  public reference!: string
}

export class CancelTransactionDto {
  @IsString()
  @IsNotEmpty()
  public reference!: string
}

export class InitiateWithdrawalDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string
}

export class ConfirmWithdrawalOtpDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string

  @IsString()
  @IsNotEmpty()
  public code!: string
}

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  public recipientId!: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number
}

export class ConfirmTransferDto {
  @IsString()
  @IsNotEmpty()
  public recipientId!: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public code!: string
}
