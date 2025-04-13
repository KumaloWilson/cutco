import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "transactions",
  timestamps: true,
})
export class Transaction extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  senderId!: number

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  receiverId!: number

  @Column({
    type: DataType.DECIMAL(20, 2),
    allowNull: false,
  })
  amount!: number

  @Column({
    type: DataType.ENUM,
    values: ["deposit", "withdrawal", "transfer", "payment"],
    allowNull: false,
  })
  type!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "completed", "failed", "cancelled"],
    defaultValue: "pending",
  })
  status!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  reference!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  fee!: number

  @BelongsTo(() => User, "senderId")
  sender!: User

  @BelongsTo(() => User, "receiverId")
  receiver!: User
}

export default Transaction
