import { Role } from '../constants/roles';

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      branchId: string | null;
      email: string;
    }
    interface Request {
      user?: AuthUser;
    }
  }
}
export {};