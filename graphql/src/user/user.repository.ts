import { FirestoreRepository } from '@hgraph/storage';
import { Injectable } from '@nestjs/common';
import { User } from './user.model';

@Injectable()
export class UserRepository extends FirestoreRepository<User> {
  constructor() {
    super(User);
  }
}
