import { AuthDto } from '@/auth/dto/auth.dto';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserData } from '@/auth/auth.interface';

export const User = createParamDecorator(
  (property: string, ctx: ExecutionContext): AuthUserData | AuthDto | keyof AuthUserData => {
    const request = ctx.switchToHttp().getRequest();
    const { user } = request;

    return property ? user?.[property] : user;
  },
);
