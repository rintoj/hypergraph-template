import * as admin from 'firebase-admin';
import {
  decodeAuthToken,
  encodeAuthToken,
  expirationToSeconds,
} from '../auth/auth.utils';
import { User, UserRole } from '../user/user.model';

export async function verifyFirestoreUserWithEmail(
  email: string,
  password: string,
) {
  const firebaseApiKey = process.env.FIREBASE_API_KEY;
  const url = `https://identitytoolkit.googleapis.com/v1/users:signInWithPassword?key=${firebaseApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      email: email,
      password: password,
      returnSecureToken: true,
    }),
  });
  const data = await response.json();
  return data;
}

export async function createFirestoreUser(
  name: string,
  email: string,
  password: string,
) {
  return await admin.auth().createUser({ displayName: name, email, password });
}

export async function createFirestoreToken(
  idToken: string,
  user: Pick<User, 'id' | 'roles'>,
) {
  return await encodeAuthToken({
    authToken: {
      idToken,
      userId: user.id as string,
      roles: user.roles.join(', '),
    },
    secret: process.env.TOKEN_SECRET,
    maxAgeInSeconds: expirationToSeconds(process.env.TOKEN_EXPIRY ?? ''),
  });
}

export async function verifyAndDecodeFirestoreToken(authToken: string) {
  try {
    const decodedToken = await decodeAuthToken({
      authToken,
      secret: process.env.TOKEN_SECRET,
    });
    if (!decodedToken) return undefined;
    const { idToken, roles, userId } = decodedToken;
    await admin.auth().verifyIdToken(idToken);
    return { idToken, userId, roles: roles.split(',') as UserRole[] };
  } catch (error) {
    console.error('Invalid firestore token: ', error);
    return undefined;
  }
}
