import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"

@Table({
  tableName: "notifications",
  timestamps: true,
})
export class Notification extends Model {
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
  type!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  data!: object

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isRead!: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSent!: boolean

  @BelongsTo(() => User)
  user!: User
}

export default Notification
