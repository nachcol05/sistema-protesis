import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dniFormato',
  standalone: true // Lo hacemos standalone para poder importarlo directo donde queramos
})
export class DniFormatoPipe implements PipeTransform {
  
  transform(value: string | number | null | undefined): string {
    if (!value) return '';
    
    // Lo convertimos a string limpio de espacios
    let dniStr = value.toString().trim();
    
    // Si no es un número o no tiene el largo de un DNI aproximado, lo devolvemos igual
    if (isNaN(Number(dniStr)) || dniStr.length < 6 || dniStr.length > 8) {
      return dniStr;
    }
    
    // Algoritmo para clavarle los puntos de miles (Formato Argentino)
    return Number(dniStr).toLocaleString('es-AR');
  }
}