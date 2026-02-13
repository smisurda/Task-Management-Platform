import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { SeedModule } from './seed/seed.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  Organization,
  User,
  Task,
  AuditLog,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'data/tasks.sqlite',
      entities: [Organization, User, Task, AuditLog],
      synchronize: true,
    }),
    AuthModule,
    TasksModule,
    AuditModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
