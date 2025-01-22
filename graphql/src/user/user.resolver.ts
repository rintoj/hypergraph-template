import { Context, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../context';
import { User } from './user.model';
import { UserRepository } from './user.repository';

@Resolver()
export class UserResolver {
  constructor(private readonly userRepository: UserRepository) {}

  @Query(() => User, { nullable: true })
  async me(
    @Context()
    context: RequestContext,
  ): Promise<User> {
    return this.userRepository.findById(context.accountId);
  }
}
