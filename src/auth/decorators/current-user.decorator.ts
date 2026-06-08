import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayloadUser {
  id: string;
  username: string;
  role: 'facilitator' | 'member' | 'guest';
  email: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayloadUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayloadUser;
    return data ? user?.[data] : user;
  },
);
