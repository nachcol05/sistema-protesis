import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { UserRole } from '../../../core/models/user.model';
import { EditableUserProfile, UserProfile, UserService } from '../../../core/services/user.service';

type ProfileField = keyof EditableUserProfile;

@Component({
  selector: 'app-admin-usuarios',
  imports: [],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsuariosComponent {
  private readonly userService = inject(UserService);

  readonly error = signal('');
  readonly usuarios = toSignal(
    this.userService.watchUsers().pipe(
      catchError(error => {
        this.error.set(`Falló la consulta de perfiles (${this.firebaseErrorDetails(error)}).`);
        return of([]);
      })
    ),
    { initialValue: [] }
  );
  readonly guardandoId = signal<string | null>(null);
  readonly drafts = signal<Record<string, EditableUserProfile>>({});
  readonly guardado = signal('');

  draftFor(usuario: UserProfile): EditableUserProfile {
    return this.drafts()[usuario.id] ?? {
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      dni: usuario.dni ?? '',
      telefono: usuario.telefono ?? ''
    };
  }

  actualizarCampo(usuario: UserProfile, field: ProfileField, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.drafts.update(drafts => ({
      ...drafts,
      [usuario.id]: { ...this.draftFor(usuario), [field]: value }
    }));
    this.guardado.set('');
  }

  async guardarPerfil(usuario: UserProfile): Promise<void> {
    const profile = Object.fromEntries(
      Object.entries(this.draftFor(usuario)).map(([field, value]) => [field, value.trim()])
    ) as EditableUserProfile;

    if (Object.values(profile).some(value => !value)) {
      this.error.set('Completa nombre, apellido, DNI y teléfono antes de guardar.');
      return;
    }

    this.guardandoId.set(usuario.id);
    this.error.set('');
    this.guardado.set('');
    try {
      await this.userService.updateProfile(usuario.id, profile);
      this.drafts.update(drafts => {
        const { [usuario.id]: _savedDraft, ...remaining } = drafts;
        return remaining;
      });
      this.guardado.set(`Datos de ${usuario.email} guardados.`);
    } catch (error) {
      this.error.set(`No se pudieron guardar los datos (${this.firebaseErrorDetails(error)}).`);
    } finally {
      this.guardandoId.set(null);
    }
  }

  async cambiarRol(usuario: UserProfile, event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const rol = select.value as UserRole;
    if (rol !== 'admin' && rol !== 'user') return;

    this.guardandoId.set(usuario.id);
    this.error.set('');
    this.guardado.set('');
    try {
      await this.userService.updateRole(usuario.id, rol);
    } catch {
      this.error.set(`No se pudo actualizar el rol de ${usuario.email}.`);
      select.value = usuario.rol;
    } finally {
      this.guardandoId.set(null);
    }
  }

  private firebaseErrorDetails(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String(error.code);
      const message = 'message' in error ? String(error.message) : '';
      return message ? `${code}: ${message}` : code;
    }
    return error instanceof Error ? error.message : 'error-desconocido';
  }
}