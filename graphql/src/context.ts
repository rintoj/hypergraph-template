import { parse } from 'cookie';
import { Request, Response } from 'express';
import { UserRole } from './user/user.enum';

export type RequestContext = {
  request: Request;
  response: Response;
  idToken?: string;
  accountId?: string;
  roles?: UserRole[];
};

type TokenDecoder = (
  token: string,
) => Promise<Pick<RequestContext, 'idToken' | 'accountId' | 'roles'>>;

function parseToken(req: Request) {
  // read from authorization header
  const authorization = req?.headers?.authorization;
  const token = authorization?.replace(/Bearer /i, '');
  if (token) return token;

  // read from cookie
  const cookies: any = req?.headers?.cookie
    ? parse(req?.headers?.cookie)
    : undefined;
  return cookies?.token;
}

export function createContext(decodeToken: TokenDecoder | undefined) {
  return async ({
    req: request,
    res: response,
  }: {
    req?: Request;
    res?: Response;
  }): Promise<RequestContext> => {
    const token = parseToken(request);
    const decodedToken = await decodeToken?.(token);
    return {
      request,
      response,
      idToken: decodedToken?.idToken,
      accountId: decodedToken?.accountId,
      roles: decodedToken?.roles as UserRole[],
    };
  };
}
