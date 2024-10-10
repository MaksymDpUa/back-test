import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/lib/prisma';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ExpirationService {
  private readonly logger = new Logger(ExpirationService.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Cron('* * * * *')
  async handleCron() {
    this.logger.log('Checking for expired projects...');
    await this.checkExpiredProjects();
  }

  async checkExpiredProjects() {
    try {
      const currentDateUTC = new Date().toISOString();

      const result = await this.prismaService.project.updateMany({
        where: {
          expiredAt: { lte: currentDateUTC },
          status: {
            notIn: [ProjectStatus.expired, ProjectStatus.deleted],
          },
        },
        data: { status: ProjectStatus.expired },
      });

      this.logger.log(`Updated ${result.count} projects to 'expired' status.`);
    } catch (error) {
      console.error('Error details:', error);
      this.logger.error('Failed to update expired projects', error);
    }
  }
}
