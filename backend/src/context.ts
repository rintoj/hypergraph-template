import { parse } from 'cookie';
import { Request, Response } from 'express';
import { AccountRole } from './account/account-role.enum';

export type RequestContext = {
  request: Request;
  response: Response;
  idToken?: string;
  accountId?: string;
  roles?: AccountRole[];
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
  const cookies: any = parse(req?.headers?.cookie);
  return cookies?.token;
}

export async function createContext(decodeToken?: TokenDecoder) {
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
      roles: decodedToken?.roles as AccountRole[],
    };
  };
}
