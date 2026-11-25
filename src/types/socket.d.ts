import { Role } from '../constants/roles';

export interface SocketAuthUser {
  id: string;
  role: Role;
  branchId: string | null;
}