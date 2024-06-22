import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
  ],
  controllers: [RoleController],
  providers: [RoleRepository, RoleService],
  exports: [RoleRepository],
})
export class RoleModule {}
