import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@app/data';
import { AUDIT_READ_ROLES } from '@app/auth';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...AUDIT_READ_ROLES)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findAll(
    @Request() req: { user: { organizationId: string } },
    @Query('limit') limit?: string
  ) {
    return this.auditService.findAll(
      req.user.organizationId,
      limit ? parseInt(limit, 10) : 100
    );
  }
}
