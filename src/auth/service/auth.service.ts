import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService, 
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };

    return {
      token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'), 
      }),
    };
  }

  async signUp(username: string, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.create(username, hashedPassword);
  }
}
