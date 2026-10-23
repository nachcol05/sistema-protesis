import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './stock-chart.html',
  styleUrls: ['./stock-chart.scss']
})
export class StockChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private firestore = inject(Firestore);

  public listaProductos: any[] = [];
  public pieChartType: ChartType = 'pie';

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    try {
      const stockRef = collection(this.firestore, 'protesis');
      const snapshot = await getDocs(stockRef);

      this.listaProductos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const conteo: { [key: string]: number } = {};

      this.listaProductos.forEach(item => {
        const producto = item.nombreProducto || item.nombre || 'Sin Nombre';
        const unidades = Number(item.cantidad || item.stock || 1);
        conteo[producto] = (conteo[producto] || 0) + unidades;
      });

      this.pieChartData = {
        labels: Object.keys(conteo),
        datasets: [
          {
            data: Object.values(conteo),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
          }
        ]
      };

      this.chart?.update();
    } catch (err) {
      console.error('Error al obtener datos de Firestore:', err);
    }
  }

  exportarExcel(): void {
    if (!this.listaProductos || this.listaProductos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const dataParaExcel = this.listaProductos.map(item => ({
      Producto: item.nombreProducto || item.nombre || '',
      Stock: item.cantidad || item.stock || 0,
      Vencimiento: item.vencimiento || item.fechaVencimiento || '',
      ObraSocial: item.obraSocial || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook: XLSX.WorkBook = { Sheets: { 'Stock': worksheet }, SheetNames: ['Stock'] };
    XLSX.writeFile(workbook, 'Reporte_Stock_Protesis.xlsx');
  }
}