import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { StockItem } from '../../../core/models/user.model';
import { DniFormatoPipe } from '../../../pipe/dni-formato.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { ProtesisService } from '../../../core/services/protesis.service';
import { FirebaseStorageService } from '../../../core/services/firebase-storage.service';
import { StockChartComponent } from '../stock-chart/stock-chart';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    DniFormatoPipe, 
    StockChartComponent,
    RouterLink
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  mostrarFormulario: boolean = false;
  idEnEdicion: string | null = null;
  dniUsuario: string = '42345678'; 
  
  searchTerm: string = '';
  soloStockBajo: boolean = false;

  protesis: StockItem[] = [];
  ordenEnVista: string | null = null;

  selectedFile: File | null = null;
  cargandoImagen: boolean = false;

  stockForm = new FormGroup({
    nombreProducto: new FormControl('', [Validators.required]),
    cantidad: new FormControl(0, [Validators.required, Validators.min(1)]),
    fechaVencimiento: new FormControl('', [Validators.required]),
    obraSocial: new FormControl('', [Validators.required])
  });

  constructor(
    public authService: AuthService,
    private protesisService: ProtesisService,
    private firebaseStorageService: FirebaseStorageService
  ) {}

  ngOnInit() {
    void this.cargarProtesis();
  }

  private async cargarProtesis() {
    try {
      this.protesis = await this.protesisService.obtenerProtesis();
    } catch (error) {
      console.error('Error al obtener prótesis:', error);
    }
  }

  get protesisFiltradas(): StockItem[] {
    const termino = this.searchTerm.trim().toLocaleLowerCase();

    return this.protesis.filter((item) => {
      const nombre = (item.tipoProtesis || item.nombreProducto || '').toLocaleLowerCase();
      return (!termino || nombre.includes(termino)) &&
        (!this.soloStockBajo || this.cantidadDe(item) <= 5);
    });
  }

  cantidadDe(item: StockItem): number {
    return item.cantidad ?? (item as StockItem & { stock?: number }).stock ?? 1;
  }

  fechaDeVencimiento(item: StockItem): Date | string | undefined {
    return item.vencimiento ||
      (item as StockItem & { fechaVencimiento?: Date | string }).fechaVencimiento;
  }

  vencimientoSuperaCincoAnios(fecha: Date | string | undefined): boolean {
    if (!fecha) return false;

    const fechaVencimiento = fecha instanceof Date
      ? new Date(fecha.getTime())
      : new Date(fecha.length === 10 ? `${fecha}T00:00:00` : fecha);

    if (Number.isNaN(fechaVencimiento.getTime())) return false;

    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setFullYear(limite.getFullYear() - 5);
    fechaVencimiento.setHours(0, 0, 0, 0);

    return fechaVencimiento < limite;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  prepararEdicion(item: any) {
    this.idEnEdicion = item.id;
    this.stockForm.patchValue({
      nombreProducto: item.tipoProtesis || item.nombreProducto,
      cantidad: item.cantidad ?? item.stock,
      fechaVencimiento: item.vencimiento || item.fechaVencimiento, 
      obraSocial: item.obraSocial
    });
    this.mostrarFormulario = true;
  }

  async guardarCambios() {
    if (this.stockForm.invalid) return;
    this.cargandoImagen = true;
    const formValues = this.stockForm.value;

    try {
      let ordenMedicaUrl = '';

      if (this.selectedFile) {
        ordenMedicaUrl = await this.firebaseStorageService.subirOrdenMedica(this.selectedFile);
      }

      if (this.idEnEdicion !== null) {
        const datosActualizar: Partial<StockItem> = {
          nombreProducto: formValues.nombreProducto!,
          cantidad: formValues.cantidad!,
          vencimiento: formValues.fechaVencimiento!,
          obraSocial: formValues.obraSocial!
        };

        if (ordenMedicaUrl) {
          datosActualizar.ordenMedicaUrl = ordenMedicaUrl;
        }

        await this.protesisService.actualizarProtesis(this.idEnEdicion, datosActualizar);
      } else {
        const nuevaProtesis: Omit<StockItem, 'id'> = {
          nombreProducto: formValues.nombreProducto!,
          cantidad: formValues.cantidad!,
          vencimiento: formValues.fechaVencimiento!,
          obraSocial: formValues.obraSocial!,
          ordenMedicaUrl: ordenMedicaUrl || '',
          marca: '',
          tipoProtesis: formValues.nombreProducto!,
          numeroSerie: '',
          doctor: '',
          tipoCaja: 'General',
          proveedorId: ''
        };
        await this.protesisService.agregarProtesis(nuevaProtesis);
      }

      await this.cargarProtesis();
    } catch (error) {
      console.error('Error al guardar la prótesis:', error);
    } finally {
      this.cargandoImagen = false;
      this.cerrarFormulario();
    }
  }

  async borrarItem(id: string) {
    if (id) {
      await this.protesisService.borrarProtesis(id);
      await this.cargarProtesis();
    }
  }

  esImagenData(url: string | undefined): boolean {
    return url?.startsWith('data:image/') ?? false;
  }

  verOrden(url: string | undefined) {
    if (url && this.esImagenData(url)) {
      this.ordenEnVista = url;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.idEnEdicion = null;
    this.selectedFile = null;
    this.stockForm.reset();
  }
}