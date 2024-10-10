import { Module } from '@nestjs/common';
import { ExpirationService } from './service/expiration.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from 'src/lib/prisma';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ExpirationService, PrismaService],
})
    
export class SchedulersModule {}
