import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';
import { Role } from '@app/data';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({
    type: 'simple-enum',
    enum: Role,
  })
  role: Role;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.createdBy)
  tasks: Task[];
}
