import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/require-permission.decorator';
import { PERMISSIONS } from '@app/auth';
import { CreateTaskDto, UpdateTaskDto, TaskListQueryDto } from '@app/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PERMISSIONS.TASK_CREATE)
  create(@Body() dto: CreateTaskDto, @Request() req: { user: unknown }) {
    return this.tasksService.create(dto, req.user as Parameters<typeof this.tasksService.create>[1]);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission(PERMISSIONS.TASK_READ)
  findAll(
    @Request() req: { user: unknown },
    @Query() query: TaskListQueryDto
  ) {
    return this.tasksService.findAll(req.user as Parameters<typeof this.tasksService.findAll>[0], query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PERMISSIONS.TASK_READ)
  findOne(@Param('id') id: string, @Request() req: { user: unknown }) {
    return this.tasksService.findOne(id, req.user as Parameters<typeof this.tasksService.findOne>[1]);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PERMISSIONS.TASK_UPDATE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req: { user: unknown }
  ) {
    return this.tasksService.update(id, dto, req.user as Parameters<typeof this.tasksService.update>[2]);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission(PERMISSIONS.TASK_DELETE)
  remove(@Param('id') id: string, @Request() req: { user: unknown }) {
    return this.tasksService.remove(id, req.user as Parameters<typeof this.tasksService.remove>[1]);
  }
}
