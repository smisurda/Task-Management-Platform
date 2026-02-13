import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { TaskStatus, TaskCategory } from '@app/data';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    default: TaskStatus.Todo,
  })
  status: TaskStatus;

  @Column({
    type: 'simple-enum',
    enum: TaskCategory,
    default: TaskCategory.Work,
  })
  category: TaskCategory;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column('uuid')
  createdById: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
