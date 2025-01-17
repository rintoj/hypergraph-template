import { registerEnumType } from '@nestjs/graphql';

export enum AccountRole {
  Admin = 'Admin',
  User = 'User',
}
registerEnumType(AccountRole, { name: 'AccountRole' });
