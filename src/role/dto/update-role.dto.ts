import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNotEmpty()
  @MinLength(2)
  readonly name?: string;
}
