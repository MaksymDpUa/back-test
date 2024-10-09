import { Controller, Post, Patch, Delete, Param, Body, Get, Request, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { CreateProjectDto } from '../dto/project-create.dto';
import { UpdateProjectDto } from '../dto/project-update.dto';


@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async list(
    @Request() req,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('search') search: string,
  ): Promise<any> {
    const userId = req.user.sub as number;

    const { projects, total } = await this.projectService.findMany({
      limit: Number(limit) || 10,
      offset: Number(offset) || 0,
      search: search || '',
      userId: userId,
    });

    return {
      data: projects.map((x) => ({
        id: x.id,
        name: x.name,
        url: x.url,
        status: x.status,
        expiredAt: x.expiredAt,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })),
      total: total,
      size: projects.length,
      offset: offset,
      limit: limit,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)  
  async createProject(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user.sub as number;
    return this.projectService.createProject({ ...createProjectDto, userId });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)  
  async updateProject(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    const projectId = parseInt(id, 10);
    return this.projectService.updateProject(projectId, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  
  async deleteProject(@Param('id') id: string) {
    const projectId = parseInt(id, 10);
    return this.projectService.deleteProject(projectId);
  }
}
