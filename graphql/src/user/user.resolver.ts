import { CurrentUser } from '@/auth';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';

@Resolver()
export class UserResolver {
  constructor(@InjectRepo(User) private userRepository: Repository<User>) {}

  @Query(() => User, { nullable: true })
  me(@CurrentUser() user: any) {
    console.log(user);
    return this.userRepository.findById(user?.id);
  }
}
