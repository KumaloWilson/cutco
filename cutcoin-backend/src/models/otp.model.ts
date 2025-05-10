import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"
import { Merchant } from "./merchant.model"

@Table({
  tableName: "otps",
  timestamps: true,
})
export class OTP extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "userId", // Explicitly specify the field name
  })
  userId!: number

  @ForeignKey(() => Merchant)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "merchant_id", // Explicitly specify the field name
  })
  merchantId!: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: "phoneNumber", // Explicitly specify the field name
  })
  phoneNumber!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code!: string

  @Column({
    type: DataType.ENUM,
    values: [
      "registration",
      "login",
      "password_reset",
      "withdrawal",
      "merchant_registration",
      "merchant_password_reset",
      "transaction",
      "transfer",
      "merchant_transaction",
      "merchant_transfer",
      "merchant_withdrawal",
      "merchant_login",
      "merchant_otp_verification",
      "merchant_otp_verification_resend",
    ],
    allowNull: false,
  })
  purpose!: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expiresAt", // Explicitly specify the field name
  })
  expiresAt!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: "isUsed", // Explicitly specify the field name
  })
  isUsed!: boolean

  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Merchant)
  merchant!: Merchant
}

export default OTP
