import { PassThrough, Stream, Transform } from 'stream';
import { ExporterService } from './exporter.service';

describe('ExporterService', () => {
  const service = new ExporterService();

  describe('createCsvStream()', () => {
    it('returns a stream', () => {
      const stream = service.createCsvStream();

      expect(stream).toBeInstanceOf(Stream);
      stream.end();
    });
  });

  describe('writeToCsv(stream, rows)', () => {
    it('writes to a stream', () => {
      const stream = <Transform><unknown>{ write: jest.fn() };
      (stream.write as jest.Mock).mockReturnValue(true);

      const result = service.writeToCsv(stream, []);

      expect(result).toBeTrue();
      expect(stream.write).toBeCalledTimes(1);
      expect(stream.write).toBeCalledWith([]);
    });
  });

  describe('parseStream()', () => {
    it('returns a parsed stream', () => {
      const stream = new PassThrough();
      const parsed = service.parseStream(stream);

      expect(parsed).toBeInstanceOf(Stream);
      parsed.end();
    });
  });
});
