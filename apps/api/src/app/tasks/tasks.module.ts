import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuditModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
