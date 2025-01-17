import { FirestoreRepository } from '@hgraph/storage';
import { Injectable } from '@nestjs/common';
import { Account } from './account.model';

@Injectable()
export class AccountRepository extends FirestoreRepository<Account> {
  constructor() {
    super(Account);
  }
}
