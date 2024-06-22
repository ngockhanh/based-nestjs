import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { CacheService } from './cache.service';
import { FlushQueryDto } from './dto/flush-query.dto';

@ApiTags('cache')
@Controller('cache')
export class CacheController extends BaseController {
  /**
   * Creates an instance of CacheController.
   *
   * @param {CacheService} cache
   */
  constructor(private readonly cache: CacheService) {
    super();
  }

  @Get('/')
  async index(): Promise<object> {
    return {
      message: "Nope, we don't display all this.cache. :)",
      code: HttpStatus.OK,
    };
  }

  @Get('/:key')
  async find(@Param('key') key: string) {
    const value = await this.cache.get(key);

    return {
      key,
      value,
      code: HttpStatus.OK,
    };
  }

  @Delete('/')
  async flush(@Query() query: FlushQueryDto) {
    let message = 'Cache has been deleted.';
    const { pattern } = query;

    if (pattern) {
      message = `Cache with pattern "${pattern}" has been deleted.`;
      await this.cache.forgetByPattern(pattern);
    } else {
      await this.cache.flush();
    }

    return { message, code: HttpStatus.OK };
  }

  @Delete('/:key')
  async delete(@Param('key') key: string) {
    let code = HttpStatus.OK;
    let message = `Cache with key "${key}" has been deleted.`;

    const result = await this.cache.forget(key);

    if (!result) {
      code = HttpStatus.NOT_MODIFIED;
      message = `Cache with key "${key}" does not exist.`;
    }

    return { message, code };
  }
}
