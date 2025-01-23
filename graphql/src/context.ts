import type { Request, Response } from 'express';
import { AuthMetadata } from './auth/auth.model';

export type RequestContext = {
  req: Request;
  res: Response;
  user: AuthMetadata;
};
