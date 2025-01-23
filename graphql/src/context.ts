import type { Request, Response } from 'express';
import { AuthInfo } from './auth/auth.model';

export type RequestContext = {
  req: Request;
  res: Response;
  auth: AuthInfo;
};
