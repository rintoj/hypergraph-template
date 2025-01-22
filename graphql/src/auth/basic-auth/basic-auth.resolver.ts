import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../../user/user.model';
import { BasicAuthGuard } from './basic-auth.strategy';

@Resolver()
export class BasicAuthResolver {
  @UseGuards(BasicAuthGuard)
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
