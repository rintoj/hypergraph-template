import { hkdf } from '@panva/hkdf';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { v4 as uuid } from 'uuid';
import { Auth } from './auth.model';

export async function generateKey(secret: string) {
  return await hkdf('sha256', secret, '', 'AUTH_TOKEN_ENCRYPTION', 32);
}

export async function encodeAuthToken({
  authToken,
  secret,
  maxAgeInSeconds,
}: {
  authToken: Auth;
  secret: string;
  maxAgeInSeconds: number;
}) {
  const now = () => (Date.now() / 1000) | 0;
  return await new EncryptJWT(authToken as any)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(now() + maxAgeInSeconds)
    .setJti(uuid())
    .encrypt(await generateKey(secret));
}

export async function decodeAuthToken({
  authToken,
  secret,
}: {
  authToken: string;
  secret: string;
}): Promise<Auth | null> {
  if (!authToken) return null;
  const encryptionSecret = await generateKey(secret);
  const { payload } = await jwtDecrypt(authToken, encryptionSecret, {
    clockTolerance: 15,
  });
  return payload as unknown as Auth;
}

export function expirationToSeconds(expiry: string) {
  let seconds = 0;
  const timeRegex = /^(\d+)([d|h|m|s])$/;
  const matches = expiry.match(timeRegex);
  if (matches && matches.length === 3) {
    const value = parseInt(matches[1], 10);
    const unit = matches[2];
    switch (unit) {
      case 'd':
        seconds = value * 24 * 60 * 60;
        break;
      case 'h':
        seconds = value * 60 * 60;
        break;
      case 'm':
        seconds = value * 60;
        break;
      case 's':
        seconds = value;
        break;
      default:
        seconds = 0;
    }
  } else {
    throw new Error('Invalid expiration time');
  }
  return seconds;
}
