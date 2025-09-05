import { HttpInterceptorFn } from '@angular/common/http';

export const LicenseHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const licenseId = localStorage.getItem('licenseId');
  if (licenseId) {
    req = req.clone({
      setHeaders: { 'x-license-id': licenseId }
    });
  }
  return next(req);
};
