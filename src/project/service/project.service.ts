import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma';
import { CreateProjectDto } from '../dto/project-create.dto';
import { UpdateProjectDto } from '../dto/project-update.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany({ limit, offset, search, userId }: { limit: number; offset: number; search: string; userId: number }) {
    try {
      const whereCondition = {
        userId: userId,
        status: { not: ProjectStatus.deleted },  
        OR: [
          { name: { contains: search } }, 
          { url: { contains: search } },  
        ],
      };

      const total = await this.prismaService.project.count({
        where: whereCondition,
      });

      const projects = await this.prismaService.project.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
      });

      return { projects, total };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

    async findProjectById(id: number) {
    try {
      return await this.prismaService.project.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to find project');
    }
  }

  async createProject(createProjectDto: CreateProjectDto) {
    try {
      return await this.prismaService.project.create({
        data: createProjectDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async updateProject(id: number, updateProjectDto: UpdateProjectDto) {
    try {
      return await this.prismaService.project.update({
        where: { id },
        data: updateProjectDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {  
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

async deleteProject(id: number) {
  try { 
    const project = await this.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }    
    return await this.prismaService.project.update({
      where: { id },
      data: { status: ProjectStatus.deleted }, 
    });
  } catch (error) {
    throw new InternalServerErrorException('Failed to delete project');
  }
}
  

}
