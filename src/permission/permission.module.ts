import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from '@/role/role.repository';
import { Permission } from './permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './permission.service';
import { PermissionCategory } from './permission-category.entity';
import { PermissionCategoryRepository } from './permission-category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, PermissionCategory]),
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService,
    PermissionRepository,
    PermissionCategoryRepository,
    RoleRepository,
  ],
  exports: [PermissionRepository],
})
export class PermissionModule {}
