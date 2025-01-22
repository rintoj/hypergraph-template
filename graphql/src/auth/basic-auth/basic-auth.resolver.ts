import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthMetadata } from './basic-auth.model';
import {
  BasicAuthSignInGuard,
  BasicAuthSignUpGuard,
} from './basic-auth.strategy';

@Resolver()
export class BasicAuthResolver {
  @UseGuards(BasicAuthSignInGuard)
  @Mutation(() => AuthMetadata)
  signInWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: any,
  ) {
    if (!username || !password) {
      throw new UnauthorizedException();
    }
    return context.user;
  }

  @UseGuards(BasicAuthSignUpGuard)
  @Mutation(() => AuthMetadata)
  signUpWithUsername(
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
