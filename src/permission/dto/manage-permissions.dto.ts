import {
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ManagePermissionItemDto } from './manage-permission-item.dto';

export class ManagePermissionsDto {
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ message: ' must be an object with a required property "name" (string)' })
  @Type(() => ManagePermissionItemDto)
  readonly data: ManagePermissionItemDto[];
}
