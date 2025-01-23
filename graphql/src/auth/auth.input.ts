import { z } from 'zod';

export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';

export const LoginWithUsernameInput = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginWithUsernameInput = z.infer<typeof LoginWithUsernameInput>;
