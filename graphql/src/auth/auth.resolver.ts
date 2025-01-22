import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from './auth-global.guard';
import { AuthSignInGuard, AuthSignUpGuard } from './auth.guard';
import { AuthMetadata } from './auth.model';

@Resolver()
export class AuthResolver {
  @Public()
  @UseGuards(AuthSignInGuard)
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

  @Public()
  @UseGuards(AuthSignUpGuard)
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
