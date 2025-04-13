import { Sequelize } from "sequelize-typescript"
import config from "./database"

const env = process.env.NODE_ENV || "development"
const sequelize = new Sequelize({
  database: config.development.database,
  username: config.development.username,
  password: config.development.password,  
  host: config.development.host,  
  port: config.development.port,  
  dialect: config.development.dialect,
  logging: config.development.logging,
  pool: config.development.pool,
  models: [__dirname + "/../models"],
})

export default sequelize

