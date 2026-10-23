import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isRegisterMode: boolean = false; // Maneja el estado entre Login y Registro

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellido: [{ value: '', disabled: true }, Validators.required],
      dni: [{ value: '', disabled: true }, Validators.required],
      telefono: [{ value: '', disabled: true }, Validators.required]
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    for (const field of ['nombre', 'apellido', 'dni', 'telefono']) {
      const control = this.loginForm.get(field);
      if (this.isRegisterMode) {
        control?.enable();
      } else {
        control?.reset('');
        control?.disable();
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, nombre, apellido, dni, telefono } = this.loginForm.getRawValue();
    this.errorMessage = '';

    if (this.isRegisterMode) {
      try {
        const credential = await this.authService.register(email, password);
        await this.userService.createProfile(credential.user.uid, {
          nombre,
          apellido,
          dni,
          telefono,
          email
        });
        await this.router.navigate(['/stock']);
      } catch {
        this.errorMessage = 'No se pudo completar el registro. Verifica el correo y vuelve a intentarlo.';
      }
      return;
    }

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/stock']);
    } catch {
      this.errorMessage = 'Credenciales inválidas o usuario no registrado.';
    }
  }
}