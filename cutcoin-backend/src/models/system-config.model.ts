import { Table, Column, Model, DataType } from "sequelize-typescript"

@Table({
  tableName: "system_configs",
  timestamps: true,
})
export class SystemConfig extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  key!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  value!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean
}
