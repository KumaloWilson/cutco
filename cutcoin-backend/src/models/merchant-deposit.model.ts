import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"
import { Merchant } from "./merchant.model"

@Table({
  tableName: "merchant_deposits",
  timestamps: true,
})
export class MerchantDeposit extends Model {
  @ForeignKey(() => Merchant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  merchantId!: number

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  studentId!: number

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  cashAmount!: number

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  cutcoinAmount!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reference!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "approved", "rejected", "completed"],
    defaultValue: "pending",
  })
  status!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  approvedBy!: number // Admin ID who approved the deposit

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt!: Date

  @BelongsTo(() => Merchant)
  merchant!: Merchant

  @BelongsTo(() => User)
  student!: User
}
