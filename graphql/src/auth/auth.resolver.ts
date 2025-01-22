import { BadRequestException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import { createFirestoreUser } from '../firebase/firebase-auth';
import { User, UserRole, UserStatus } from '../user/user.model';
import { UserService } from '../user/user.service';
import { CreateUserInput } from './auth.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async me(
    @Context()
    context: RequestContext,
  ): Promise<User> {
    return this.userService.findById(context.userId);
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args({ name: 'input', type: () => CreateUserInput })
    input: CreateUserInput,
  ): Promise<User> {
    const userByEmail = await this.userService.findByEmail(input.email);
    if (userByEmail) {
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

  // @UseGuards(LocalGuard)
  // @Mutation(() => LoginResponse)
  // async loginWithEmail(
  //   @Args({ name: 'input', type: () => LoginWithEmailInput })
  //   input: LoginWithEmailInput,

  //   @Context()
  //   context: RequestContext,
  // ): Promise<LoginResponse> {
  // const user = await this.userService.findByEmail(input.email);
  // if (!user) {
  //   throw new Error(`A user with this email (${input.email}) does not exist`);
  // }
  // const authUser = await verifyFirestoreUserWithEmail(
  //   input.email,
  //   input.password,
  // );
  // if (!authUser || authUser.error) {
  //   throw new Error('Invalid email or password');
  // }
  // const token = await createFirestoreToken(authUser.idToken, user);
  // context.response.cookie('token', token, {
  //   httpOnly: true,
  //   maxAge: expirationToSeconds(process.env.TOKEN_EXPIRY) * 1000,
  //   sameSite: 'none',
  //   secure: true,
  // });
  // console.log({ input, context });
  // return {
  //   id: authUser.id,
  //   user: authUser,
  //   token,
  // };
  // return {} as any;
  // }

  @Mutation(() => Boolean)
  async logout(
    @Context()
    context: RequestContext,
  ) {
    context.response.clearCookie('token');
    return true;
  }
}
