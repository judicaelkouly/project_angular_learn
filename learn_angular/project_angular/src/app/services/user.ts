import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { tap } from 'rxjs';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: User;
}

@Service()
export class UserService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  currentUser = signal<User | null>(null);

  registerUser(user: User) {
    return this.http.post(`${this.api}/auth/register`, user);
  }

  loginUser(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, credentials).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('token', token);
        this.currentUser.set(user);
      })
    );
  }

  // Récupère l'utilisateur connecté (utile après un rafraîchissement de la page)
  loadCurrentUser() {
    return this.http
      .get<User>(`${this.api}/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
