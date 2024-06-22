/**
 * Convert value to boolean.
 *
 * @param {*} value
 *
 * @returns {boolean}
 */
export function boolean(value: any): boolean {
  const falsy = [0, '0', 'false', false];
  const truthy = [1, '1', 'true', true];

  if (falsy.includes(value)) {
    return false;
  }

  if (truthy.includes(value)) {
    return true;
  }

  return Boolean(value);
}

/**
 * Get the value from the object by the given path.
 *
 * @export
 * @param {object} object
 * @param {string} path
 *
 * @returns {any}
 */
export function get(object: object, path: string): any {
  return path.split('.').reduce((acc, v) => acc[v], object);
}

/**
 * Parse the value to int.
 *
 * @export
 * @param {any} value
 *
 * @returns {Number}
 */
export function toInt(value: any): number {
  return parseInt(value, 10) || 0;
}

/**
 * Return the current NODE_ENV
 *
 * @returns {string}
 */
export function getNodeEnv(): string {
  return process.env.NODE_ENV;
}

/**
 * Determine if current node env is "dev"
 *
 * @return {boolean}
 */
export function isDev(): boolean {
  const env = getNodeEnv();

  return env === 'development' || env === 'dev' || env === 'local';
}

/**
 * Determine if current node env is "staging"
 *
 * @return {boolean}
 */
export function isStaging(): boolean {
  return getNodeEnv() === 'staging';
}

/**
 * Determine if current node env is "production"
 *
 * @return {boolean}
 */
export function isProduction(): boolean {
  const env = getNodeEnv();

  return env === 'production' || env === 'prod';
}

/**
 * Determine if current node env is "test"
 *
 * @return {boolean}
 */
export function isTest(): boolean {
  return getNodeEnv() === 'test';
}

/**
 * Determine if current env is running in "CI"
 *
 * @return {boolean}
 */
export function isCI(): boolean {
  return boolean(process.env.CI) === true;
}

/**
 * Remove undefined values from object.
 *
 * @export
 * @param {object} obj
 *
 * @return {object}
 */
export function cleanObject(obj: object): object {
  return (
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
      .reduce((out, [key, value]) => ({ ...out, [key]: value }), {})
  );
}

/**
 * Determine if a value is empty.
 *
 * @export
 * @param {*} value
 *
 * @return {boolean}
 */
export function isEmpty(value: any): boolean {
  if (value === null
    || value === undefined
    || (Array.isArray(value) && value.length === 0)
    || (typeof value === 'object' && Object.keys(value).length === 0)
  ) {
    return true;
  }

  return false;
}

/**
 * Formats search string for FTS.
 *
 * @export
 * @param {string} text
 *
 * @return {string[]}
 */
export function formatTextForFts(text: string): string {
  return text
    .split(' ')
    .filter((value) => value.trim() !== '')
    .join(' & ');
}

/**
 * Transform string from camelCase to snake_case.
 *
 * @export
 * @param  {string} str
 *
 * @return {string}
 */
export function snakeCase(str: string): string {
  return str.split(/(?=[A-Z])/).map((word) => word.toLowerCase()).join('_');
}
