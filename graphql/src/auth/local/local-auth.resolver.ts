import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../../context';
import { Auth } from '../auth.decorator';
import { Public } from '../auth.guard';
import { AuthInfo } from '../auth.model';
import { SignInResponse, SignUpResponse } from './local-auth.response';
import { LocalAuthService } from './local-auth.service';

@Resolver()
export class LocalAuthResolver {
  constructor(private readonly localAuthService: LocalAuthService) {}

  @Public()
  @Mutation(() => SignInResponse)
  signInWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context() context: RequestContext,
  ) {
    return this.localAuthService.signInWithUsername(
      username,
      password,
      context.res,
    );
  }

  @Public()
  @Mutation(() => SignUpResponse)
  signUpWithUsername(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    return this.localAuthService.signUpWithUsername(username, password);
  }

  @Public()
  @Mutation(() => Boolean)
  async signOut(@Context() context: RequestContext, @Auth() auth?: AuthInfo) {
    await this.localAuthService.signOut(context.res, auth?.userId);
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
