import type { User } from "../models/user.model"
import type { Admin } from "../models/admin.model"

declare global {
  namespace Express {
    interface Request {
      user?: User
      admin?: Admin
    }
  }
}
