import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorators/roles.decorator';
  import { Role } from '@prisma/client';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      // Get required roles from decorator
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      // If no roles required → allow
      if (!requiredRoles) {
        return true;
      }
  
      const { user } = context.switchToHttp().getRequest();
  
      // If user not attached
      if (!user) {
        throw new ForbiddenException('Access denied');
      }
  
      // Check if user role matches required role
      const hasRole = requiredRoles.includes(user.role);
  
      if (!hasRole) {
        throw new ForbiddenException('You do not have permission');
      }
  
      return true;
    }
  }