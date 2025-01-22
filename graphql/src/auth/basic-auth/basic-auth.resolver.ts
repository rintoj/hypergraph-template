import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthMetadata } from './basic-auth.model';
import {
  BasicAuthSigninGuard,
  BasicAuthSignupGuard,
} from './basic-auth.strategy';

@Resolver()
export class BasicAuthResolver {
  @UseGuards(BasicAuthSigninGuard)
  @Mutation(() => AuthMetadata)
  signinWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: any,
  ) {
    if (!username || !password) {
      throw new UnauthorizedException();
    }
    return context.user;
  }

  @UseGuards(BasicAuthSignupGuard)
  @Mutation(() => AuthMetadata)
  signupWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: any,
  ) {
    if (!username || !password) {
      throw new UnauthorizedException();
    }
    return context.user;
  }
}
