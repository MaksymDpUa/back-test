import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from '../user/module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/lib/prisma';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: new ConfigService().get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '300s' },
    }),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
