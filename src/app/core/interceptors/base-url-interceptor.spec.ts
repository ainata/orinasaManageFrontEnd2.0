import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL_STORAGE_KEY } from '@core/authentication';
import { LocalStorageService, MemoryStorageService } from '@shared';
import { BASE_URL, baseUrlInterceptor } from './base-url-interceptor';

describe('BaseUrlInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  const baseUrl = 'https://foo.bar';

  const setBaseUrl = (url: string | null) => {
    TestBed.overrideProvider(BASE_URL, { useValue: url });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageService, useClass: MemoryStorageService },
        { provide: BASE_URL, useValue: null },
        provideHttpClient(withInterceptors([baseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => httpMock.verify());

  it('should not prepend base url when base url is empty', () => {
    setBaseUrl(null);

    http.get('/api/user').subscribe(data => expect(data).toEqual({ success: true }));

    httpMock.expectOne('/api/user').flush({ success: true });
  });

  it('should prepend base url when request url is an api path and does not have http scheme', () => {
    setBaseUrl(baseUrl);

    http.get('./api/user').subscribe(data => expect(data).toEqual({ success: true }));
    httpMock.expectOne(baseUrl + '/api/user').flush({ success: true });
  });

  it('should not prepend base url for non api request like i18n assets', () => {
    setBaseUrl(baseUrl);

    http.get('i18n/fr.json').subscribe(data => expect(data).toEqual({ success: true }));
    httpMock.expectOne('i18n/fr.json').flush({ success: true });
  });

  it('should prepend stored key when base url from env is empty', () => {
    setBaseUrl(null);
    const store = TestBed.inject(LocalStorageService);
    store.set(API_BASE_URL_STORAGE_KEY, baseUrl);

    http.get('/api/user').subscribe(data => expect(data).toEqual({ success: true }));
    httpMock.expectOne(baseUrl + '/api/user').flush({ success: true });
  });

  it('should not prepend stored key for /api/user/menu', () => {
    setBaseUrl(null);
    const store = TestBed.inject(LocalStorageService);
    store.set(API_BASE_URL_STORAGE_KEY, baseUrl);

    http.get('/api/user/menu').subscribe(data => expect(data).toEqual({ success: true }));
    httpMock.expectOne('/api/user/menu').flush({ success: true });
  });
});
