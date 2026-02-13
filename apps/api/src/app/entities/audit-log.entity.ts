import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  organizationId: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ type: 'varchar', nullable: true })
  resourceId: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
