import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';

@Module({
  providers: [UserResolver, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
