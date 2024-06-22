import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class ManagePermissionItemDto {
  @IsNotEmpty()
  @IsNumber()
  readonly roleId: number;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    oneOf: [
      {
        type: 'array',
        items: { type: 'string' },
      },
      {
        type: 'array',
        items: { type: 'number' },
      },
    ],
  })
  readonly permissions: string[] | number[];
}
