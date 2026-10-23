import { Injectable, inject, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { UserRole } from '../models/user.model';

export interface UserProfile {
  id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  dni?: string;
  email: string;
  rol: UserRole;
}

export type NewUserProfile = Omit<UserProfile, 'id' | 'rol'>;
export type EditableUserProfile = Required<Pick<UserProfile, 'nombre' | 'apellido' | 'telefono' | 'dni'>>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);

  async getRole(uid: string): Promise<UserRole | null> {
    const snapshot = await runInInjectionContext(this.injector, () =>
      getDoc(doc(this.firestore, 'usuarios', uid))
    );
    const role = snapshot.data()?.['rol'];
    return role === 'admin' || role === 'user' ? role : null;
  }

  watchRole(uid: string): Observable<UserRole | null> {
    return docData(doc(this.firestore, 'usuarios', uid)).pipe(
      map(profile => {
        const role = profile?.['rol'];
        return role === 'admin' || role === 'user' ? role : null;
      })
    );
  }

  createProfile(uid: string, profile: NewUserProfile): Promise<void> {
    return setDoc(doc(this.firestore, 'usuarios', uid), {
      ...profile,
      rol: 'user',
      createdAt: serverTimestamp()
    });
  }

  watchUsers(): Observable<UserProfile[]> {
    return collectionData(query(collection(this.firestore, 'usuarios')), {
      idField: 'id'
    }) as Observable<UserProfile[]>;
  }

  updateRole(uid: string, rol: UserRole): Promise<void> {
    return updateDoc(doc(this.firestore, 'usuarios', uid), { rol });
  }

  updateProfile(uid: string, profile: EditableUserProfile): Promise<void> {
    return updateDoc(doc(this.firestore, 'usuarios', uid), profile);
  }
}