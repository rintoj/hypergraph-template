import { FirestoreRepository } from '@hgraph/storage';
import { AuthMetadata } from './basic-auth.model';

export class BasicAuthRepository extends FirestoreRepository<AuthMetadata> {
  constructor() {
    super(AuthMetadata);
  }
}
