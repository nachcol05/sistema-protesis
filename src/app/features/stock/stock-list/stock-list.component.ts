import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { StockItem } from '../../../core/models/user.model';
import { DniFormatoPipe } from '../../../pipe/dni-formato.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DniFormatoPipe],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent {
  mostrarFormulario: boolean = false;
  idEnEdicion: string | null = null;
  dniUsuario: string = '42345678'; 
  
  searchTerm: string = '';
  soloStockBajo: boolean = false;

  authService = inject(AuthService);

  stockForm = new FormGroup({
    nombreProducto: new FormControl('', [Validators.required]),
    cantidad: new FormControl(0, [Validators.required, Validators.min(1)]),
    fechaVencimiento: new FormControl('', [Validators.required]),
    obraSocial: new FormControl('', [Validators.required])
  });

  protesis: StockItem[] = [
    { 
      id: '1', 
      nombreProducto: 'Prótesis Cadera', 
      cantidad: 2, 
      vencimiento: '2026-12-01', 
      obraSocial: 'OSDE',
      marca: 'Generic Medical',
      tipoProtesis: 'Traumatología',
      numeroSerie: 'SN-001',
      doctor: 'Dr. Pérez',
      tipoCaja: 'Importada',
      proveedorId: '101'
    },
    { 
      id: '2', 
      nombreProducto: 'Clavo Titanio', 
      cantidad: 15, 
      vencimiento: '2026-10-10', 
      obraSocial: 'PAMI',
      marca: 'Titanium Corp',
      tipoProtesis: 'Fijación',
      numeroSerie: 'SN-002',
      doctor: 'Dra. Gómez',
      tipoCaja: 'Nacional',
      proveedorId: '102'
    }
  ];

  get filteredProtesis(): StockItem[] {
    return this.protesis.filter(item => {
      const coincideTexto = item.nombreProducto.toLowerCase().includes(this.searchTerm.toLowerCase());
      const coincideStock = this.soloStockBajo ? item.cantidad <= 5 : true;
      return coincideTexto && coincideStock;
    });
  }

  prepararEdicion(item: StockItem) {
    this.idEnEdicion = item.id;
    this.stockForm.patchValue({
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
      fechaVencimiento: item.vencimiento as string, 
      obraSocial: item.obraSocial
    });
    this.mostrarFormulario = true;
  }

  guardarCambios() {
    if (this.stockForm.invalid) return;
    const formValues = this.stockForm.value;

    if (this.idEnEdicion !== null) {
      this.protesis = this.protesis.map(p => {
        if (p.id === this.idEnEdicion) {
          return {
            ...p,
            nombreProducto: formValues.nombreProducto!,
            cantidad: formValues.cantidad!,
            vencimiento: formValues.fechaVencimiento!, 
            obraSocial: formValues.obraSocial!
          };
        }
        return p;
      });
    } else {
      const nueva: StockItem = {
        id: crypto.randomUUID(),
        nombreProducto: formValues.nombreProducto!,
        cantidad: formValues.cantidad!,
        vencimiento: formValues.fechaVencimiento!, 
        obraSocial: formValues.obraSocial!,
        marca: '',
        tipoProtesis: '',
        numeroSerie: '',
        doctor: '',
        tipoCaja: 'General',
        proveedorId: ''
      };
      this.protesis.push(nueva);
    }
    this.cerrarFormulario();
  }

  borrarItem(id: string) {
    this.protesis = this.protesis.filter(p => p.id !== id);
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.idEnEdicion = null;
    this.stockForm.reset();
  }
}