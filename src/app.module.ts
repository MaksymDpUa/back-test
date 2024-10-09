import { Module } from '@nestjs/common';
import { ProjectModule } from './project/module';
import { UserModule } from './user/module';
import { AuthModule } from './auth/module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, UserModule, ProjectModule,  ConfigModule.forRoot({
      isGlobal: true, 
    }),],
})
export class AppModule {}
