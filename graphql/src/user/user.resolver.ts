import { Auth, AuthInfo } from '@hgraph/auth';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';

@Resolver()
export class UserResolver {
  constructor(@InjectRepo(User) private userRepository: Repository<User>) {}

  @Query(() => User, { nullable: true })
  me(@Auth() auth: AuthInfo) {
    return this.userRepository.findById(auth?.userId);
  }
}
