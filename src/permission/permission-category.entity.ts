import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import type { Permission } from './permission.entity';

@Entity('permission_categories')
export class PermissionCategory {
  @PrimaryColumn()
    name: string;

  @Column()
    description: string;

  @OneToMany('Permission', 'categoryEntity', { eager: false })
    permissions?: Permission[];
}
