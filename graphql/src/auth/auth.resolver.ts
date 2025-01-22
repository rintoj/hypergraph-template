import { BadRequestException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import {
  createFirestoreToken,
  createFirestoreUser,
  verifyFirestoreUserWithEmail,
} from '../firebase/firebase-auth';
import { User, UserRole, UserStatus } from '../user/user.model';
import { UserService } from '../user/user.service';
import { CreateAccountInput, LoginWithEmailInput } from './auth.input';
import { LoginResponse } from './auth.response';
import { expirationToSeconds } from './auth.utils';

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async me(
    @Context()
    context: RequestContext,
  ): Promise<User> {
    return this.userService.findById(context.accountId);
  }

  @Mutation(() => User)
  async createAccount(
    @Args({ name: 'input', type: () => CreateAccountInput })
    input: CreateAccountInput,
  ): Promise<User> {
    const accountByEmail = await this.userService.findByEmail(input.email);
    if (accountByEmail) {
      throw new BadRequestException(
        `An user with the email address (${input.email}) already exists. Please use a different email address.`,
      );
    }
    const userRecord = await createFirestoreUser(
      input.name,
      input.email,
      input.password,
    );
    return await this.userService.createUser({
      name: input.name,
      email: input.email,
      providerUid: userRecord.uid,
      isEmailVerified: userRecord.emailVerified,
      photoURL: userRecord.photoURL,
      status: userRecord.disabled ? UserStatus.Disabled : UserStatus.Active,
      roles: [UserRole.User],
    });
  }

  @Mutation(() => LoginResponse)
  async loginWithEmail(
    @Args({ name: 'input', type: () => LoginWithEmailInput })
    input: LoginWithEmailInput,

    @Context()
    context: RequestContext,
  ): Promise<LoginResponse> {
    const account = await this.userService.findByEmail(input.email);
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
