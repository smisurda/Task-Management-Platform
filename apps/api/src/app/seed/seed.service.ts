import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { Role } from '@app/data';
import { TaskStatus, TaskCategory } from '@app/data';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) return;

    const org = this.orgRepo.create({
      name: 'Default Organization',
      parentId: null,
    });
    await this.orgRepo.save(org);

    const passwordHash = await bcrypt.hash('admin123', 10);
    const owner = this.userRepo.create({
      email: 'owner@example.com',
      passwordHash,
      organizationId: org.id,
      role: Role.Owner,
    });
    await this.userRepo.save(owner);

    const tasks = [
      { title: 'Welcome task', description: 'Get started', status: TaskStatus.Todo, category: TaskCategory.Work, orderIndex: 0 },
      { title: 'Review docs', description: 'Read the README', status: TaskStatus.InProgress, category: TaskCategory.Work, orderIndex: 1 },
      { title: 'Personal goal', description: 'Exercise', status: TaskStatus.Todo, category: TaskCategory.Personal, orderIndex: 2 },
    ];
    for (const t of tasks) {
      const task = this.taskRepo.create({
        ...t,
        organizationId: org.id,
        createdById: owner.id,
      });
      await this.taskRepo.save(task);
    }
    console.log('Seed completed: 1 org, 1 owner (owner@example.com / admin123), 3 tasks');
  }
}
