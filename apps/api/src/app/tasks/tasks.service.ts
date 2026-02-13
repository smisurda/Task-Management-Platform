import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskListQueryDto } from '@app/data';
import { TaskStatus, TaskCategory } from '@app/data';
import { AuditService } from '../audit/audit.service';

export interface RequestUser {
  userId: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private auditService: AuditService
  ) {}

  async create(dto: CreateTaskDto, user: RequestUser): Promise<Task> {
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.Todo,
      category: dto.category ?? TaskCategory.Work,
      orderIndex: dto.orderIndex ?? 0,
      organizationId: user.organizationId,
      createdById: user.userId,
    });
    const saved = await this.taskRepository.save(task);
    await this.auditService.log(
      user.userId,
      user.organizationId,
      'CREATE',
      'task',
      saved.id,
      JSON.stringify({ title: saved.title })
    );
    return saved;
  }

  async findAll(
    user: RequestUser,
    query: TaskListQueryDto
  ): Promise<Task[]> {
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .where('task.organizationId = :orgId', { orgId: user.organizationId });

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('task.category = :category', { category: query.category });
    }

    const sortBy = query.sortBy ?? 'orderIndex';
    const sortOrder = (query.sortOrder ?? 'asc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`task.${sortBy}`, sortOrder);

    return qb.getMany();
  }

  async findOne(id: string, user: RequestUser): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, organizationId: user.organizationId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    user: RequestUser
  ): Promise<Task> {
    const task = await this.findOne(id, user);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.category !== undefined) task.category = dto.category;
    if (dto.orderIndex !== undefined) task.orderIndex = dto.orderIndex;
    task.updatedAt = new Date();
    const saved = await this.taskRepository.save(task);
    await this.auditService.log(
      user.userId,
      user.organizationId,
      'UPDATE',
      'task',
      saved.id,
      JSON.stringify(dto)
    );
    return saved;
  }

  async remove(id: string, user: RequestUser): Promise<void> {
    const task = await this.findOne(id, user);
    await this.taskRepository.remove(task);
    await this.auditService.log(
      user.userId,
      user.organizationId,
      'DELETE',
      'task',
      id,
      JSON.stringify({ title: task.title })
    );
  }
}
