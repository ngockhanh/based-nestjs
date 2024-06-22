import { PaginationDto } from './pagination.dto';

export class PaginatedDto<Entity> {
  readonly data: Entity[] | any;

  readonly pagination?: PaginationDto;
}
