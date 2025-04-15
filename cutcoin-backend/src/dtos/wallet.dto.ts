import { IsNumber, IsString, IsNotEmpty, Min } from "class-validator"

export class DepositDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string
}

export class ConfirmDepositDto {
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

export class WithdrawDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public amount!: number

  @IsString()
  @IsNotEmpty()
  public merchantNumber!: string
}

export class ConfirmWithdrawalDto {
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
