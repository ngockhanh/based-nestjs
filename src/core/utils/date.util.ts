import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import * as UTC from 'dayjs/plugin/utc';

export class DateUtil {
  static now(): Dayjs {
    return dayjs();
  }

  static today(format: string = 'YYYY-MM-DD') {
    return this.formateDate(this.now(), format);
  }

  static todayUtc(format: string = 'YYYY-MM-DD') {
    dayjs.extend(UTC);

    return this.formateDate(this.now().utc(), format);
  }

  static addDays(date: Dayjs, daysToAdd: number): Dayjs {
    return date.add(daysToAdd, 'day');
  }

  static addMonths(date: Dayjs, monthsToAdd: number): Dayjs {
    return date.add(monthsToAdd, 'month');
  }

  static subtractMonths(date: Dayjs, monthsToSubtract: number): Dayjs {
    return date.subtract(monthsToSubtract, 'month');
  }

  static formateDate(date: Dayjs | string, format: string = 'YYYY-MM-DD'): string {
    if (typeof date === 'string') {
      return dayjs(date).format(format);
    }

    return date.format(format);
  }

  static startOfTheMonth(date: Dayjs): Dayjs {
    return date.startOf('month');
  }

  static endOfTheMonth(date: Dayjs): Dayjs {
    return date.endOf('month');
  }

  static inUtc(
    date: string,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ): Dayjs {
    dayjs.extend(UTC);

    return dayjs.utc(date, format);
  }

  static unix(): number {
    return dayjs().unix();
  }

  static fromUnix(
    timestamp: number | string,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    dayjs.extend(UTC);

    return dayjs.unix(Number(timestamp)).utc().format(format);
  }
}
