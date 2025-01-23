import { generateIdOf } from '@hgraph/storage';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepo(User) private readonly userRepository: Repository<User>,
  ) {}

  generateUserId(user: Pick<User, 'email' | 'phoneNumber'>) {
    if (user.email) {
      return generateIdOf(`email:${user.email}`);
    }
    return generateIdOf(`phone:${user.phoneNumber}`);
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findOne((q) => q.whereEqualTo('email', email));
  }

  findByPhoneNumber(phoneNumber: string) {
    return this.userRepository.findOne((q) =>
      q.whereEqualTo('phoneNumber', phoneNumber),
    );
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.userRepository.insert({
      ...user,
      id: this.generateUserId(user),
    });
  }
}
