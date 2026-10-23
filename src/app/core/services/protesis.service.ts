import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { StockItem } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProtesisService {
  private firestore: Firestore = inject(Firestore);

  async obtenerProtesis(): Promise<StockItem[]> {
    const protesisRef = collection(this.firestore, 'protesis');
    const snapshot = await getDocs(protesisRef);
    return snapshot.docs.map(documento => ({
      ...documento.data(),
      id: documento.id
    })) as StockItem[];
  }

  async agregarProtesis(protesis: Omit<StockItem, 'id'>) {
    const protesisRef = collection(this.firestore, 'protesis');
    return addDoc(protesisRef, protesis);
  }

  async actualizarProtesis(id: string, protesis: Partial<StockItem>) {
    const docRef = doc(this.firestore, `protesis/${id}`);
    return updateDoc(docRef, protesis);
  }

  async borrarProtesis(id: string) {
    const docRef = doc(this.firestore, `protesis/${id}`);
    return deleteDoc(docRef);
  }
}