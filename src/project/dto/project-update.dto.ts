import { ProjectStatus } from '@prisma/client';


export type UpdateProjectDto = {
  name?: string;
  url?: string;
  status?: ProjectStatus; 
};