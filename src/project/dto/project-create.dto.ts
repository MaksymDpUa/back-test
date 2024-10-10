import { ProjectStatus } from '@prisma/client';

export type CreateProjectDto = {
  userId: number;
  name: string;
  url: string;
  status: ProjectStatus;
  expiredAt?: Date;
};
