import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginPayload, RegisterPayload, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usamos un 'signal' para que todo el sistema sepa en tiempo real si hay alguien logueado
  currentUser = signal<User | null>(null);

 constructor(
  private storage: StorageService,
  private router: Router
) {
  // --- AGREGÁ ESTO ---
  // Si no hay usuarios en el sistema, creamos uno para poder probar
  const existingUsers = this.storage.getItem('users');
  if (!existingUsers || existingUsers.length === 0) {
    const adminUser = {
      dni: '123',
      password: '123',
      nombre: 'Ezequiel',
      role: 'admin',
      estado: 'approved'
    };
    this.storage.setItem('users', [adminUser]);
  }
  // -------------------

  const savedUser = this.storage.getItem('current_user');
  if (savedUser) {
    this.currentUser.set(savedUser);
  }
}

  // --- LÓGICA DE INGRESO ---
  login(payload: LoginPayload): boolean {
    const users: User[] = this.storage.getItem('users') || [];
    
    // Buscamos el usuario por DNI y contraseña
    const user = users.find(u => u.dni === payload.dni && u.password === payload.password);

    if (user) {
      this.currentUser.set(user);
      this.storage.setItem('current_user', user);
      return true;
    }
    return false;
  }

  // --- LÓGICA DE REGISTRO ---
  register(payload: RegisterPayload): boolean {
    const users: User[] = this.storage.getItem('users') || [];

    // Verificamos que el DNI no esté ya registrado
    if (users.find(u => u.dni === payload.dni)) {
      return false; 
    }

    // Creamos el nuevo usuario con datos por defecto
    const newUser: User = {
      ...payload,
      id: crypto.randomUUID(), // Generamos un ID único
      role: 'user',            // Por defecto son usuarios normales
      estado: 'pending',       // Empiezan como pendientes hasta que el admin los apruebe
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.storage.setItem('users', users);
    return true;
  }

  // --- UTILIDADES ---
  logout() {
    this.currentUser.set(null);
    this.storage.removeItem('current_user');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}