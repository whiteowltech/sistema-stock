import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const LicenseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = (window as any).ng?.injector?.get?.('Router') ?? undefined;
  return next(req).pipe(
    // @ts-ignore
    catchError((error) => {
        if (error.status === 401 || error.error?.error?.includes('Licencia inválida')) {
            alert(error.error?.error );
            localStorage.removeItem('logueado');
            if (router) {
              router.navigate(['/login']);
            } else {
              window.location.href = '/login';
            }
      }
      return throwError(() => error);
    })
  );
};
