import { Readable, Transform, Writable } from 'stream';
import { Injectable } from '@nestjs/common';
import {
  CsvFormatterStream,
  CsvParserStream,
  format,
  parseStream,
} from 'fast-csv';
import * as ExcelJS from 'exceljs';
import { CONTENT_TYPES } from '@/constants/export';

export type ExportData = {
  stream: any,
  filename: string,
  contentType: typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES]
  contentLength? :number,
  fn?: Promise<any>,
};

/**
 * This class will be used as interface of
 * 3rd party packages related for export.
 *
 * @export
 * @class ExporterService
 */
@Injectable()
export class ExporterService {
  /**
   * Create a stream for csv export.
   *
   * @return {CsvFormatterStream<any, any>}
   */
  createCsvStream(): CsvFormatterStream<any, any> {
    return format({ headers: true });
  }

  /**
   * Write csv string to current stream.
   *
   * @param {Transform} stream
   * @param {any[]} row
   *
   * @return {boolean}
   */
  writeToCsv(stream: Transform, row: any[]): boolean {
    return stream.write(row);
  }

  /**
   * Parse a readable stream.
   *
   * @param {(NodeJS.ReadableStream | Readable)} stream
   * @param {*} [opts]
   *
   * @return {CsvParserStream<any, any>}
   */
  parseStream(stream: NodeJS.ReadableStream | Readable, opts?: any): CsvParserStream<any, any> {
    return parseStream(stream, opts);
  }

  createExcelWorksheet(sheetName?: string, stream?: Writable) {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet(sheetName || 'Sheet1');

    return { workbook, worksheet };
  }
}
