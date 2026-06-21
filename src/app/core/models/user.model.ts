// src/app/core/models/user.model.ts

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type ProviderType = 'normal' | 'obra social';

// 1. Interfaz de Usuario (Registro y Login)
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  password?: string; // Opcional para cuando consultamos listas
  role: UserRole;
  estado: UserStatus;
  createdAt: Date | string;
}

// 2. Interfaz para el Stock de Prótesis
export interface StockItem {
  id: string;
  nombreProducto: string;
  marca: string;
  tipoProtesis: string;
  numeroSerie: string;
  cantidad: number;
  vencimiento: Date | string;
  doctor: string;
  tipoCaja: string;
  obraSocial: string;
  proveedorId: string; // Relación con el proveedor
  certificado?: string;
}

// 3. Interfaz para Proveedores
export interface Provider {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  tipo: ProviderType;
  protesisQueProvee: string[]; // IDs de categorías o nombres
}

// 4. Registro de Movimientos (Lo que ve el Admin)
export interface StockMovement {
  id: string;
  fecha: Date | string;
  usuarioId: string; // Quién lo hizo
  usuarioNombre: string; // Para mostrarlo fácil en la tabla
  tipoMovimiento: 'ingreso' | 'egreso';
  productoId: string;
  cantidad: number;
  motivo?: string; // Ej: "Venta", "Devolución", "Ajuste"
}

// Payloads para formularios (evita errores en el tipado de inputs)
export interface RegisterPayload extends Omit<User, 'id' | 'role' | 'estado' | 'createdAt'> {}
export interface LoginPayload {
  dni: string;
  password: string;
}