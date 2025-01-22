import { injectable } from 'tsyringe';
import { config } from '../config';

const authenticationUrl = `https://identitytoolkit.googleapis.com/v1/users:signInWithPassword?key=${config.FIREBASE_API_KEY}`;
@injectable()
export class FirebaseAuthService {
  async signInWithEmail(email: string, password: string) {
    const response = await fetch(authenticationUrl, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      console.log({ response, authenticationUrl, text, email, password });
      throw new Error('Invalid email or password');
    }
    return await response.json();
    // return await signInWithEmailAndPassword(auth, email, password);
  }
}
