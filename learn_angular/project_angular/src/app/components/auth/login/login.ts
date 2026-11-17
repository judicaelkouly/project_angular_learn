import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login {
     fb = inject(FormBuilder);

    userService = inject(UserService);
     router = inject(Router);
    errorMessage: string = '';

   form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
   });


onSubmit() {
  const { email, password } = this.form.getRawValue();
  const user = { email, password };
  this.userService.loginUser(user as { email: string; password: string }).subscribe({
    next: () => this.router.navigate(['/']),
    error: (err) => (this.errorMessage = err.error?.message ?? 'Erreur de connexion'),
  });
}

}
