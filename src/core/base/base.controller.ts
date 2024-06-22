import { boolean, toInt } from '../core.helpers';
import { BadRequestException, ForbiddenException } from '../exceptions';
import { AuthUserData } from '../interfaces/auth.interface';
import { Paginated } from './base.repository';
import { PaginatedDto } from '../dto/paginated.dto';
import { SuccessResponse } from '../interfaces/success-response.interface';

 type Page = {
   current: number;
   size: number;
 };

 type Filters = {
   [key: string]: any;
 };

 type Sort = [
  sortField: string,
  sortOrder?: string,
 ];

 type ListOptions = {
   filters: Filters;
   page: Page;
   sort: Sort;
   user?: AuthUserData;
 };

export abstract class BaseController {
  /**
   * Return a list data with pagination node.
   *
   * @protected
   * @param {Paginated<any>} data
   * @param {any} req
   * @param {Function|null} [transform=null]
   *
   * @returns {Object}
   */
  protected listWithPagination(
    data: Paginated<any>,
    req: any,
    transform: Function = null,
  ): PaginatedDto<any> {
    const { rows, count } = data;
    const pagination = {
      ...this.getPagination(req),
      total: count,
    };
    const list = transform ? transform(rows, req) : rows;

    return { data: list, pagination };
  }

  /**
   * Get parsed id from request.
   *
   * @protected
   * @param {any} req
   *
   * @returns {number}
   */
  protected getId(req: any): number {
    return toInt(req.params.id);
  }

  /**
   * Get valid options for listing records.
   * Options can include filters, sort, or paginate.
   *
   * @protected
   * @param {*} req
   * @param {boolean} paginate
   *
   * @returns {object}
   */
  protected getListOpts(req: any, paginate: boolean = true): ListOptions {
    const opts = <ListOptions>{};
    const filters = this.getFilters(req);

    if (Object.keys(filters).length > 0) {
      opts.filters = filters;
    }

    const page = this.getPagination(req);

    if (paginate && page) {
      opts.page = page;
    }

    const sort = this.getSort(req);

    if (sort) {
      opts.sort = sort;
    }

    return opts;
  }

  /**
   * Get pagination parameters from request.
   *
   * @protected
   * @param {any} req
   *
   * @returns {Page|null}
   */
  protected getPagination(req: any): Page | null {
    const { page, pageSize, infinite } = req.query;

    if (boolean(infinite) === true) {
      return null;
    }

    return {
      current: toInt(page) || 1,
      size: toInt(pageSize) || 15, // default limit
    };
  }

  /**
   * Get sort parameters from request.
   *
   * @protected
   * @param {any} req
   *
   * @returns {Sort|null}
   */
  protected getSort(req: any): Sort | null {
    const { sortField, sortOrder } = req.query;

    if (!sortField) {
      return null;
    }

    const sort = [sortField];

    if (sortOrder) {
      sort.push(sortOrder);
    }

    return <Sort>sort;
  }

  /**
   * Get valid filters from the request.
   * This will be overriden depending on the handler.
   *
   * @protected
   * @param {any} _req
   *
   * @returns {Filters}
   */
  protected getFilters(_req: any): Filters {
    return {};
  }

  protected respondSuccess(message: string = 'Success!'): SuccessResponse {
    return {
      success: true,
      message,
    };
  }

  /**
   * Throw bad request error with 400 status.
   *
   * @protected
   * @param {string} message
   * @param {string} [code='']
   *
   * @throws {BadRequestException}
   */
  protected throwBadRequestException(message: string, code: string = '') {
    throw new BadRequestException(message, code);
  }

  /**
   * Throw forbidden error with 403 status.
   *
   * @protected
   * @param {string} message
   * @param {string} [code='']
   *
   * @throws {BadRequestException}
   */
  protected throwForbiddenException(message: string, code: string = '') {
    throw new ForbiddenException(message, code);
  }
}
