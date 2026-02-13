import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  parentId: string | null;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks: Task[];
}
