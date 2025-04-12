import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "merchants",
  timestamps: true,
})
export class Merchant extends Model {
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
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contactPerson!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  contactPhone!: string

  @Column({
    type: DataType.ENUM,
    values: ["pending", "approved", "rejected", "suspended"],
    defaultValue: "pending",
  })
  status!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean

  @BelongsTo(() => User)
  user!: User
}
