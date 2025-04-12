import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript"
import { User } from "./user.model"
import { Admin } from "./admin.model"

@Table({
  tableName: "audit_logs",
  timestamps: true,
})
export class AuditLog extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId!: number

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  adminId!: number

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  entity!: string

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  entityId!: number

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  oldValues!: object

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  newValues!: object

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ipAddress!: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  userAgent!: string

  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Admin)
  admin!: Admin
}
