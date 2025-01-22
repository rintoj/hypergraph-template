import { Repository } from '@hgraph/storage';
import { AuthMetadata } from './basic-auth.model';

export class BasicAuthRepository extends Repository<AuthMetadata> {
  constructor() {
    super(AuthMetadata);
  }
}
