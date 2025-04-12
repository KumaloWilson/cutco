import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "otps",
  timestamps: true,
})
export class OTP extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code!: string

  @Column({
    type: DataType.ENUM,
    values: ["registration", "login", "transaction", "password_reset"],
    allowNull: false,
  })
  purpose!: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isUsed!: boolean

  @BelongsTo(() => User)
  user!: User
}
