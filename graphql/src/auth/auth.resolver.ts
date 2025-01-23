import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import { Auth } from './auth.decorator';
import { Public } from './auth.guard';
import { AuthInfo, AuthMetadata } from './auth.model';
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
  @Mutation(() => Boolean)
  async signOut(@Context() context: RequestContext, @Auth() auth?: AuthInfo) {
    await this.authService.signOut(context.res, auth?.userId);
    return true;
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
