import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  orderBy,
  query,
  serverTimestamp,
  Timestamp
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

interface ChatMessage {
  id: string;
  texto: string;
  usuarioEmail: string;
  fecha?: Timestamp;
}

@Component({
  selector: 'app-chat',
  imports: [DatePipe, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly messagesCollection = collection(this.firestore, 'mensajes');
  private readonly messagesQuery = query(this.messagesCollection, orderBy('fecha', 'asc'));
  private readonly messages$ = (collectionData(this.messagesQuery, {
    idField: 'id'
  }) as Observable<ChatMessage[]>).pipe(
    catchError(error => {
      this.errorLectura.set(`No se pudieron cargar los mensajes (${this.firebaseErrorDetails(error)}).`);
      return of([]);
    })
  );

  readonly mensajes = toSignal(this.messages$, { initialValue: [] });
  readonly usuario = toSignal(this.authService.user$, { initialValue: null });
  readonly texto = signal('');
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly errorLectura = signal('');

  async enviar(): Promise<void> {
    const texto = this.texto().trim();
    const usuarioEmail = this.usuario()?.email;
    if (!texto || !usuarioEmail || this.enviando()) return;

    this.enviando.set(true);
    this.error.set('');
    try {
      await addDoc(this.messagesCollection, {
        texto,
        usuarioEmail,
        fecha: serverTimestamp()
      });
      this.texto.set('');
    } catch (error) {
      this.error.set(`No se pudo enviar el mensaje (${this.firebaseErrorDetails(error)}).`);
    } finally {
      this.enviando.set(false);
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