import { HttpInterceptorFn } from '@angular/common/http';

const API_URL = 'http://localhost:3000';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // On n'ajoute le token que pour notre propre API
  if (token && req.url.startsWith(API_URL)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
