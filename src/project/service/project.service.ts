import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma';
import { CreateProjectDto } from '../dto/project-create.dto';
import { UpdateProjectDto } from '../dto/project-update.dto';
import { Project, ProjectStatus } from '@prisma/client';
import { ProjectListResponse } from '../dto/project-list-response.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany({
    limit,
    offset,
    search,
    userId,
  }: {
    limit: number;
    offset: number;
    search: string;
    userId: number;
  }): Promise<ProjectListResponse> {
    const projects = await this.prismaService.project.findMany({
      where: {
        userId: userId,
        status: { not: ProjectStatus.deleted },
        OR: [{ name: { contains: search } }, { url: { contains: search } }],
      },
      skip: offset,
      take: limit,
    });
    const total = await this.prismaService.project.count({
      where: {
        userId: userId,
        status: { not: ProjectStatus.deleted },
        OR: [{ name: { contains: search } }, { url: { contains: search } }],
      },
    });

    return {
      data: projects,
      total: total,
      size: projects.length,
      offset: offset,
      limit: limit,
    };
  }

  async findProjectById(id: number): Promise<Project | null> {
    try {
      return await this.prismaService.project.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to find project');
    }
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      const expirationDate = createProjectDto.expiredAt
        ? new Date(createProjectDto.expiredAt).toISOString()
        : null;
      return await this.prismaService.project.create({
        data: { ...createProjectDto, expiredAt: expirationDate },
      });
    } catch (error) {
      console.error('Error details:', error);
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async updateProject(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
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

  async deleteProject(
    id: number,
  ): Promise<{ id: number; status: ProjectStatus }> {
    try {
      const project = await this.findProjectById(id);
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return await this.prismaService.project.update({
        where: { id },
        data: { status: ProjectStatus.deleted },
        select: { id: true, status: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete project');
    }
  }
}
