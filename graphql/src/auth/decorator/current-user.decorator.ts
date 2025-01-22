import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getContextFromExecutionCtx } from '../util/guard.util';

export const CurrentUser = createParamDecorator(
  (data: unknown, executionContext: ExecutionContext) => {
    const req = getContextFromExecutionCtx(executionContext);
    return req.user;
  },
);
