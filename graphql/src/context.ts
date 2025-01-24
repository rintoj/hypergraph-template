import { AuthInfo } from '@hgraph/auth';
import type { Request, Response } from 'express';

export type RequestContext = {
  req: Request;
  res: Response;
  auth: AuthInfo;
};
