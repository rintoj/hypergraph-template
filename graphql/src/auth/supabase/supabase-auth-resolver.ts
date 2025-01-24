import { Mutation, Resolver } from '@nestjs/graphql';
import { SupabaseAuthService } from './supabase-auth.service';

@Resolver()
export class SupabaseAuthResolver {
  constructor(private readonly supabaseService: SupabaseAuthService) {}

  @Mutation(() => String)
  async signinWithSupabase(accessToken: string) {
    const user = await this.supabaseService.authenticate(accessToken);
    console.log({ user });
  }
}
