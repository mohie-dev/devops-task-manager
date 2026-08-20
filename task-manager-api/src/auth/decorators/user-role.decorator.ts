import { SetMetadata } from "@nestjs/common";
import { Role } from "utils/enum";

// Roles Method Decorator
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles)