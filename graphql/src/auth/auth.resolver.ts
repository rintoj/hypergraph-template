import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import { Public } from './auth.guard';
import { AuthMetadata } from './auth.model';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthMetadata)
  signInWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: RequestContext,
  ) {
    return this.authService.signInWithUsername(username, password, context.res);
  }

  @Public()
  @Mutation(() => AuthMetadata)
  signUpWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    return this.authService.signUpWithUsername(username, password);
  }

  @Public()
  @Query(() => String)
  public() {
    return 'public: true';
  }

  @Query(() => String)
  protected() {
    return 'protected: true';
  }
}
