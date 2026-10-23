import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor() {}

  subirOrdenMedica(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}