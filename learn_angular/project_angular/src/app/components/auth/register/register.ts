import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user';
import {User} from '../../../models/user.model';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
   fb = inject(FormBuilder);

    userService = inject(UserService);
    router = inject(Router);
    errorMessage: string = '';

   form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(25)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
   });

    onSubmit() {
      const name = this.form.value.name;
      const email = this.form.value.email;
      const password = this.form.value.password;

      const user = { name, email, password };

      this.userService.registerUser(user as User).subscribe(
        (response) => {
          console.log('User registered successfully:', response);
          this.form.reset();
          // Redirect to login page after successful registration
          this.router.navigate(['/login']);
        },
        (error) => {
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('Error registering user:', error);
        }
      );


      }

}

