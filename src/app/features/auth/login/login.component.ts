import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPayload } from '../../../core/models/user.model'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss' // CORREGIDO: styleUrl en singular y sin corchetes []
})
export class LoginComponent {
  loginForm = new FormGroup({
    dni: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.loginForm.valid) {
      // Usamos tu interfaz LoginPayload para asegurar que los datos sean correctos
      const payload: LoginPayload = this.loginForm.value as LoginPayload;
      const success = this.authService.login(payload);

      if (success) {
        this.router.navigate(['/stock']);
      } else {
        alert('DNI o contraseña incorrectos');
      }
    }
  }
}