import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"
import { Merchant } from "./merchant.model"

@Table({
  tableName: "merchant_transactions",
  timestamps: true,
})
export class MerchantTransaction extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number

  @ForeignKey(() => Merchant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  merchantId!: number

  @Column({
    type: DataType.ENUM,
    values: ["deposit", "withdrawal"],
    allowNull: false,
  })
  type!: string

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  amount!: number

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  fee!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reference!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "completed", "cancelled", "rejected"],
    defaultValue: "pending",
  })
  status!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  studentConfirmed!: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  merchantConfirmed!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt!: Date

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  cancelledAt!: Date

  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Merchant)
  merchant!: Merchant
}

export default MerchantTransaction
