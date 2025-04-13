import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "payments",
  timestamps: true,
})
export class Payment extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentMethod!: string // "paynow", "cash", "bank_transfer", etc.

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  amount!: number

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  cutcoinAmount!: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  reference!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  externalReference!: string // Paynow reference or other external reference

  @Column({
    type: DataType.ENUM,
    values: ["pending", "completed", "failed", "cancelled"],
    defaultValue: "pending",
  })
  status!: string

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata!: object

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  merchantId!: number // If deposit is through a merchant

  @BelongsTo(() => User)
  user!: User
}

export default Payment
