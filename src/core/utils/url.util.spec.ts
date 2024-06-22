import { UrlUtil } from './url.util';

describe('UrlUtil', () => {
  it('It returns pathname', () => {
    let pathName = UrlUtil.getPathName('/test?hell=12&world=333');
    expect(pathName).toEqual('/test');

    pathName = UrlUtil.getPathName('/test/foo');
    expect(pathName).toEqual('/test/foo');

    pathName = UrlUtil.getPathName('/test/foo/hello?foo=');
    expect(pathName).toEqual('/test/foo/hello');

    pathName = UrlUtil.getPathName('/test?foo=23&world=333&abc=333');
    expect(pathName).toEqual('/test');
  });
});
