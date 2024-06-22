import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Role } from '@/role/role.entity';
import type { PermissionCategory } from './permission-category.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({ length: 100, unique: true })
    name: string;

  @Column()
    description: string;

  @Column({ length: 100 })
    category: string;

  @ManyToMany('Role', 'permissions', { eager: false })
  @JoinTable({
    name: 'permission_role',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
    roles?: Role[];

  @ManyToOne('PermissionCategory', 'permissions', { eager: false })
  @JoinColumn({ name: 'category' })
    categoryEntity: PermissionCategory;

  @CreateDateColumn({ default: 'now() ' })
    createdAt: Date;

  @UpdateDateColumn({ default: 'now() ' })
    updatedAt: Date;
}
