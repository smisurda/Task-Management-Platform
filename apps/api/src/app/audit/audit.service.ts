import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>
  ) {}

  async log(
    userId: string,
    organizationId: string,
    action: string,
    resource: string,
    resourceId: string | null = null,
    details: string | null = null
  ): Promise<void> {
    const entry = this.auditRepository.create({
      userId,
      organizationId,
      action,
      resource,
      resourceId,
      details,
    });
    await this.auditRepository.save(entry);
    const msg = `[Audit] ${action} ${resource}${resourceId ? ` ${resourceId}` : ''} by user ${userId}`;
    console.log(msg);
  }

  async findAll(organizationId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { organizationId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
