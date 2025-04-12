import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, IsObject, IsBoolean } from "class-validator"

export class SendSMSDto {
  @IsNumber()
  @IsNotEmpty()
  public userId!: number

  @IsString()
  @IsNotEmpty()
  public message!: string

  @IsBoolean()
  @IsOptional()
  public saveNotification?: boolean
}

export class BulkSendSMSDto {
  @IsArray()
  @IsNotEmpty()
  public userIds!: number[]

  @IsString()
  @IsNotEmpty()
  public message!: string

  @IsBoolean()
  @IsOptional()
  public saveNotification?: boolean
}

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  public userId!: number

  @IsString()
  @IsNotEmpty()
  public type!: string

  @IsString()
  @IsNotEmpty()
  public title!: string

  @IsString()
  @IsNotEmpty()
  public message!: string

  @IsObject()
  @IsOptional()
  public data?: object
}
