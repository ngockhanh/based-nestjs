import * as dayjs from 'dayjs';
import * as UTC from 'dayjs/plugin/utc';
import { DateUtil } from './date.util';

jest.mock('dayjs');

describe('DateUtil', () => {
  const actualDayjs = jest.requireActual('dayjs');

  it('should return today\'s date', () => {
    const currentDate = actualDayjs();
    (dayjs as unknown as jest.Mock).mockReturnValue(currentDate);

    const result = DateUtil.today();
    expect(result).toEqual(currentDate.format('YYYY-MM-DD'));
  });

  it('should return today\'s date in utc', () => {
    actualDayjs.extend(UTC);

    const currentDate = actualDayjs().utc();
    (dayjs as unknown as jest.Mock).mockReturnValue(currentDate);

    const result = DateUtil.todayUtc();
    expect(result).toEqual(currentDate.format('YYYY-MM-DD'));
  });

  it('should return the current date', () => {
    const currentDate = actualDayjs();
    (dayjs as unknown as jest.Mock).mockReturnValue(currentDate);
    const result = DateUtil.now();
    expect(result).toEqual(currentDate);
  });

  it('should add specified date to given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    const modifiedDate = inputDate.add(3, 'day');
    (dayjs as unknown as jest.Mock).mockReturnValue(modifiedDate);

    const result = DateUtil.addDays(inputDate, 3);

    expect(result).toEqual(modifiedDate);
  });

  it('should add specified month to given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    const modifiedDate = inputDate.add(3, 'month');
    (dayjs as unknown as jest.Mock).mockReturnValue(modifiedDate);

    const result = DateUtil.addMonths(inputDate, 3);

    expect(result).toEqual(modifiedDate);
  });

  it('should subtract specified month to given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    const modifiedDate = inputDate.subtract(3, 'month');
    (dayjs as unknown as jest.Mock).mockReturnValue(modifiedDate);

    const result = DateUtil.subtractMonths(inputDate, 3);

    expect(result).toEqual(modifiedDate);
  });

  it('should format given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    let result = DateUtil.formateDate(inputDate, 'YYYY');
    expect(result).toEqual('2023');

    result = DateUtil.formateDate(inputDate, 'YYYY-MM-DD');
    expect(result).toEqual('2023-09-05');

    result = DateUtil.formateDate(inputDate);
    expect(result).toEqual('2023-09-05');
  });

  it('formats a date in string', () => {
    const inputDate = '2023-09-05 12:30:40';

    (dayjs as unknown as jest.Mock).mockReturnValue(actualDayjs(inputDate));

    expect(DateUtil.formateDate(inputDate, 'YYYY')).toEqual('2023');
    expect(DateUtil.formateDate(inputDate, 'YYYY-MM-DD')).toEqual('2023-09-05');
    expect(DateUtil.formateDate(inputDate)).toEqual('2023-09-05');
    expect(DateUtil.formateDate(inputDate, 'HH:mm:ss')).toEqual('12:30:40');
  });

  it('should return first day of month given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    const modifiedDate = inputDate.startOf('month');
    (dayjs as unknown as jest.Mock).mockReturnValue(modifiedDate);

    const result = DateUtil.startOfTheMonth(inputDate);
    expect(result).toEqual(modifiedDate);
  });

  it('should return last day of month given date', () => {
    const inputDate = actualDayjs('2023-09-05');

    const modifiedDate = inputDate.endOf('month');
    (dayjs as unknown as jest.Mock).mockReturnValue(modifiedDate);

    const result = DateUtil.endOfTheMonth(inputDate);
    expect(result).toEqual(modifiedDate);
  });

  it('should return the current unix epoch timestamp', () => {
    const currentDate = actualDayjs();
    (dayjs as unknown as jest.Mock).mockReturnValue(currentDate);

    expect(DateUtil.unix()).toEqual(currentDate.unix());
  });

  it('converts a timestamp to date time format in utc', () => {
    actualDayjs.extend(UTC);

    const timestamp = '1713407826';
    const expectedDate = actualDayjs.unix(timestamp).utc();

    (dayjs.unix as unknown as jest.Mock).mockReturnValue(expectedDate);

    expect(DateUtil.fromUnix(timestamp)).toEqual(expectedDate.format('YYYY-MM-DD HH:mm:ss'));
  });
});
