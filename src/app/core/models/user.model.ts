export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';
export type ProviderType = 'normal' | 'obra social';

// 1. Interfaz de Usuario
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  email: string;
  password?: string;
  rol: UserRole;
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
  ordenMedicaUrl?: string;
  proveedorId: string;
  certificado?: string;
}

// 3. Interfaz para Proveedores
export interface Provider {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  tipo: ProviderType;
  protesisQueProvee: string[];
}

// 4. Registro de Movimientos
export interface StockMovement {
  id: string;
  fecha: Date | string;
  usuarioId: string;
  usuarioNombre: string;
  tipoMovimiento: 'ingreso' | 'egreso';
  productoId: string;
  cantidad: number;
  motivo?: string;
}

// Payloads para formularios
export interface RegisterPayload extends Omit<User, 'id' | 'rol' | 'estado' | 'createdAt'> {}

export interface LoginPayload {
  email: string;
  password: string;
}