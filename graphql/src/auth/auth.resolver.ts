import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import {
  createFirestoreToken,
  createFirestoreUser,
  verifyFirestoreUserWithEmail,
} from '../firebase/firebase-auth';
import { User, UserRole, UserStatus } from '../user/user.model';
import { UserRepository } from '../user/user.repository';
import { CreateAccountInput, LoginWithEmailInput } from './auth.input';
import { LoginResponse } from './auth.response';
import { expirationToSeconds } from './auth.utils';

@Resolver()
export class AuthResolver {
  constructor(private readonly accountRepository: UserRepository) {}

  @Mutation(() => User)
  async createAccount(
    @Args({ name: 'input', type: () => CreateAccountInput })
    input: CreateAccountInput,
  ): Promise<User> {
    const accountByEmail = await this.accountRepository.findOne((q) =>
      q.whereEqualTo('email', input.email),
    );
    if (accountByEmail) {
      throw new Error(
        `An account with this email (${input.email}) already exists`,
      );
    }

    const userRecord = await createFirestoreUser(
      input.name,
      input.email,
      input.password,
    );

    const account = await this.accountRepository.insert({
      name: input.name,
      email: input.email,
      providerUid: userRecord.uid,
      isEmailVerified: userRecord.emailVerified,
      photoURL: userRecord.photoURL,

      status: userRecord.disabled ? UserStatus.Disabled : UserStatus.Active,
      roles: [UserRole.User],
    });
    return account;
  }

  @Mutation(() => LoginResponse)
  async loginWithEmail(
    @Args({ name: 'input', type: () => LoginWithEmailInput })
    input: LoginWithEmailInput,

    @Context()
    context: RequestContext,
  ): Promise<LoginResponse> {
    const account = await this.accountRepository.findOne((q) =>
      q.whereEqualTo('email', input.email),
    );
    if (!account) {
      throw new Error(
        `An account with this email (${input.email}) does not exist`,
      );
    }

    const user = await verifyFirestoreUserWithEmail(
      input.email,
      input.password,
    );
    if (!user || user.error) {
      throw new Error('Invalid email or password');
    }
    const token = await createFirestoreToken(user.idToken, account);
    context.response.cookie('token', token, {
      httpOnly: true,
      maxAge: expirationToSeconds(process.env.TOKEN_EXPIRY) * 1000,
      sameSite: 'none',
      secure: true,
    });
    return {
      id: account.id,
      account: account,
      token,
    };
  }

  @Mutation(() => Boolean)
  async logout(
    @Context()
    context: RequestContext,
  ) {
    context.response.clearCookie('token');
    return true;
  }
}
