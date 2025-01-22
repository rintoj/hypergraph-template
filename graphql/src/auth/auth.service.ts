import { Injectable } from '@nestjs/common';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateUser(email: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    console.log(`AuthService: validateUser: ${email}=${JSON.stringify(user)}`);
    if (!user) return null;
    return user;
  }
}
