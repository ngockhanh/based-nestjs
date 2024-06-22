import * as _ from './core.helpers';

describe('helpers Test', () => {
  describe('boolean()', () => {
    it('returns false for falsy values', () => {
      expect(_.boolean(0)).toBeFalse();
      expect(_.boolean('0')).toBeFalse();
      expect(_.boolean(false)).toBeFalse();
      expect(_.boolean('false')).toBeFalse();
      expect(_.boolean(undefined)).toBeFalse();
      expect(_.boolean(null)).toBeFalse();
    });

    it('returns true for truthy values', () => {
      expect(_.boolean(1)).toBeTrue();
      expect(_.boolean('1')).toBeTrue();
      expect(_.boolean(true)).toBeTrue();
      expect(_.boolean('true')).toBeTrue();
    });
  });

  describe('get()', () => {
    it('gets a value from a nested object by dot notation key', () => {
      const object = {
        a: { b: { c: 'value!' } },
        aa: 'AA',
        aaa: { bb: 'BB' },
      };

      expect(_.get(object, 'a.b.c')).toEqual('value!');
      expect(_.get(object, 'aa')).toEqual('AA');
      expect(_.get(object, 'aaa.bb')).toEqual('BB');
    });
  });

  describe('toInt()', () => {
    it('parses value to int and defaults to 0 for NaN', () => {
      expect(_.toInt('1')).toEqual(1);
      expect(_.toInt(2)).toEqual(2);
      expect(_.toInt('3 ')).toEqual(3);
      expect(_.toInt('qwerty')).toEqual(0);
    });
  });

  describe('cleanObject()', () => {
    it('removes keys with null and undefined values', () => {
      const obj = {
        one: 'one',
        two: null,
        three: undefined,
        four: 4,
        five: true,
      };

      expect(_.cleanObject(obj)).toStrictEqual({
        one: 'one',
        two: null,
        four: 4,
        five: true,
      });
    });
  });

  describe('isEmpty()', () => {
    it('determines if a value is empty', () => {
      expect(_.isEmpty(null)).toBeTrue();
      expect(_.isEmpty(undefined)).toBeTrue();
      expect(_.isEmpty([])).toBeTrue();
      expect(_.isEmpty({})).toBeTrue();

      expect(_.isEmpty(true)).toBeFalse();
      expect(_.isEmpty(false)).toBeFalse();
      expect(_.isEmpty(0)).toBeFalse();
      expect(_.isEmpty({ a: 'hello' })).toBeFalse();
      expect(_.isEmpty(['a'])).toBeFalse();
    });
  });

  describe('formatTextForFts()', () => {
    it('should format text for fts by removing special characters', () => {
      let result = _.formatTextForFts('Hello world');
      expect(result).toBeString();
      expect(result).toEqual('Hello & world');

      result = _.formatTextForFts('Hello     world');
      expect(result).toEqual('Hello & world');

      result = _.formatTextForFts('  Hello     world  ');
      expect(result).toEqual('Hello & world');

      result = _.formatTextForFts('hello (w!o@r#l$d)');
      expect(result).toEqual('hello & (w!o@r#l$d)');

      result = _.formatTextForFts('');
      expect(result).toEqual('');

      result = _.formatTextForFts('!!!@#$%^&*()');
      expect(result).toEqual('!!!@#$%^&*()');
    });
  });

  describe('snakeCase(str)', () => {
    it('transforms string to snake_case', () => {
      expect(_.snakeCase('valOne')).toEqual('val_one');
      expect(_.snakeCase('ValTwo')).toEqual('val_two');
      expect(_.snakeCase('val_three')).toEqual('val_three');
      expect(_.snakeCase('valFour')).toEqual('val_four');
    });
  });
});
