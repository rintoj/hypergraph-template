import { ContextType, ExecutionContext } from '@nestjs/common';

export function isGraphQLRequest(context: ExecutionContext) {
  return context.getType<ContextType | 'graphql'>() === 'graphql';
}

export function getInputFromContext(context: ExecutionContext) {
  return isGraphQLRequest(context)
    ? context.getArgByIndex(1)
    : context.getArgByIndex(0)?.body;
}

export function getRequestContext(context: ExecutionContext) {
  if (isGraphQLRequest(context)) {
    return context.getArgByIndex(2);
  }
  return context.getArgByIndex(1)?.req;
}
