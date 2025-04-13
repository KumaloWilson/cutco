import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      admin?: Admin;
    }
  }
}
