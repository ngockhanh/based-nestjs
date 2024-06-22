export class UrlUtil {
  static getPathName(url: string): string {
    return url.split('?')[0] ? url.split('?')[0] : url;
  }
}
