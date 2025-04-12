import { Admin } from "@/models/admin.model";
import { User } from "@/models/user.model";

// types/express/index.d.ts
declare namespace Express {
    export interface Request {
      user?:User
      admin?: Admin
    }
  }
  