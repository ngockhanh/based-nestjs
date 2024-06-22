import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import type { User } from '@/user/user.entity';
import type { Permission } from '@/permission/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
    id: number;

  @Column({ length: 100, unique: true })
    name: string;

  @Column()
    description: string;

  @Column()
    level: number;

  @ManyToMany('User', 'roles', { eager: false })
  @JoinTable({
    name: 'role_user',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
    users?: User[];

  @ManyToMany('Permission', 'roles', {
    eager: false,
    cascade: true,
  })
  @JoinTable({
    name: 'permission_role',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
    permissions?: Permission[];

  @CreateDateColumn({ default: 'now()' })
    createdAt: Date;

  @UpdateDateColumn({ default: 'now()' })
    updatedAt: Date;
}
