import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../../user/user.model';
import { BasicAuthSigninGuard } from './basic-auth.strategy';

@Resolver()
export class BasicAuthResolver {
  @UseGuards(BasicAuthSigninGuard)
  @Mutation(() => User)
  signInWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    if (!username || !password) {
      throw new UnauthorizedException();
    }
  }
}
